import { addDays, addMonths, addWeeks, addYears, differenceInDays, format, parseISO } from "date-fns";
import { ko } from "date-fns/locale";
import type { BillingCycle, Currency, Subscription } from "./types";
import { BILLING_CYCLES } from "./constants";

const EXCHANGE_RATES: Record<Currency, number> = {
  KRW: 1,
  USD: 1350,
  EUR: 1470,
  JPY: 9.2,
};

export function toKRW(amount: number, currency: Currency): number {
  return amount * EXCHANGE_RATES[currency];
}

export function formatMoney(amount: number, currency: Currency): string {
  const converted = currency === "KRW" ? amount : amount;
  if (currency === "KRW" || currency === "JPY") {
    return new Intl.NumberFormat("ko-KR", {
      style: "currency",
      currency,
      maximumFractionDigits: 0,
    }).format(converted);
  }
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
  }).format(converted);
}

export function monthlyAmount(sub: Subscription): number {
  const krw = toKRW(sub.amount, sub.currency);
  const { months } = BILLING_CYCLES[sub.billingCycle];
  if (sub.billingCycle === "weekly") return krw * 4.33;
  return krw / months;
}

export function yearlyAmount(sub: Subscription): number {
  return monthlyAmount(sub) * 12;
}

export function totalMonthly(subs: Subscription[]): number {
  return subs.reduce((sum, s) => sum + monthlyAmount(s), 0);
}

export function totalYearly(subs: Subscription[]): number {
  return subs.reduce((sum, s) => sum + yearlyAmount(s), 0);
}

export function nextRenewalDate(dateStr: string, cycle: BillingCycle): Date {
  const base = parseISO(dateStr);
  const now = new Date();
  let next = base;

  while (next <= now) {
    if (cycle === "weekly") next = addWeeks(next, 1);
    else if (cycle === "monthly") next = addMonths(next, 1);
    else next = addYears(next, 1);
  }
  return next;
}

export function daysUntilRenewal(sub: Subscription): number {
  const next = nextRenewalDate(sub.renewalDate, sub.billingCycle);
  return differenceInDays(next, new Date());
}

export function formatRenewalDate(date: Date): string {
  return format(date, "M월 d일 (EEE)", { locale: ko });
}

export function getUpcomingRenewals(subs: Subscription[], withinDays = 30) {
  return subs
    .map((sub) => ({
      sub,
      nextDate: nextRenewalDate(sub.renewalDate, sub.billingCycle),
      daysLeft: daysUntilRenewal(sub),
    }))
    .filter((r) => r.daysLeft >= 0 && r.daysLeft <= withinDays)
    .sort((a, b) => a.daysLeft - b.daysLeft);
}

export function categoryBreakdown(subs: Subscription[]) {
  const map = new Map<string, number>();
  for (const sub of subs) {
    const current = map.get(sub.category) ?? 0;
    map.set(sub.category, current + monthlyAmount(sub));
  }
  return Array.from(map.entries()).map(([category, amount]) => ({
    category,
    amount,
  }));
}

export function cn(...classes: (string | false | undefined | null)[]): string {
  return classes.filter(Boolean).join(" ");
}

export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export function personalMonthlyAmount(sub: Subscription): number {
  const monthly = monthlyAmount(sub);
  if (!sub.isShared || !sub.mySharePercent) return monthly;
  return monthly * (sub.mySharePercent / 100);
}

export function totalPersonalMonthly(subs: Subscription[]): number {
  return subs
    .filter((s) => s.isActive !== false)
    .reduce((sum, s) => sum + personalMonthlyAmount(s), 0);
}

export function addBillingPeriod(dateStr: string, cycle: BillingCycle): string {
  const date = parseISO(dateStr);
  let next: Date;
  if (cycle === "weekly") next = addWeeks(date, 1);
  else if (cycle === "monthly") next = addMonths(date, 1);
  else next = addYears(date, 1);
  return format(next, "yyyy-MM-dd");
}

export function defaultRenewalDate(): string {
  return format(addDays(new Date(), 7), "yyyy-MM-dd");
}
