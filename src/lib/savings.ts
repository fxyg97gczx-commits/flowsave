import { differenceInDays, parseISO } from "date-fns";
import type { Category, Subscription } from "./types";
import { CATEGORIES } from "./constants";
import { monthlyAmount, yearlyAmount } from "./utils";

export interface SavingsTip {
  id: string;
  type: "duplicate" | "unused" | "annual" | "top_spender" | "category";
  severity: "high" | "medium" | "low";
  title: string;
  description: string;
  savingsAmount?: number;
  subscriptionIds?: string[];
}

function findDuplicates(subs: Subscription[]): SavingsTip[] {
  const tips: SavingsTip[] = [];
  const byCategory = new Map<Category, Subscription[]>();

  for (const sub of subs) {
    if (sub.isActive === false) continue;
    const list = byCategory.get(sub.category) ?? [];
    list.push(sub);
    byCategory.set(sub.category, list);
  }

  for (const [cat, list] of byCategory) {
    if (list.length >= 2 && (cat === "streaming" || cat === "music")) {
      const total = list.reduce((s, sub) => s + monthlyAmount(sub), 0);
      const cheapest = list.reduce((min, sub) =>
        monthlyAmount(sub) < monthlyAmount(min) ? sub : min
      );
      tips.push({
        id: `dup-${cat}`,
        type: "duplicate",
        severity: "high",
        title: `${CATEGORIES[cat].emoji} ${CATEGORIES[cat].label} 중복 구독`,
        description: `${list.map((s) => s.name).join(", ")} — 월 ₩${Math.round(total).toLocaleString()}. 하나만 유지하면 절약 가능.`,
        savingsAmount: Math.round(total - monthlyAmount(cheapest)),
        subscriptionIds: list.map((s) => s.id),
      });
    }
  }

  return tips;
}

function findUnused(subs: Subscription[]): SavingsTip[] {
  const tips: SavingsTip[] = [];
  const now = new Date();

  for (const sub of subs) {
    if (sub.isActive === false || !sub.lastUsedAt) continue;
    const days = differenceInDays(now, parseISO(sub.lastUsedAt));
    if (days >= 60) {
      tips.push({
        id: `unused-${sub.id}`,
        type: "unused",
        severity: days >= 90 ? "high" : "medium",
        title: `${sub.name} — ${days}일 미사용`,
        description: `마지막 사용 후 ${days}일 경과. 해지 시 연 ₩${Math.round(yearlyAmount(sub)).toLocaleString()} 절약.`,
        savingsAmount: Math.round(yearlyAmount(sub)),
        subscriptionIds: [sub.id],
      });
    }
  }

  return tips;
}

function findAnnualSavings(subs: Subscription[]): SavingsTip[] {
  const tips: SavingsTip[] = [];

  for (const sub of subs) {
    if (sub.billingCycle !== "monthly" || sub.isActive === false) continue;
    const monthly = monthlyAmount(sub);
    const annualEstimate = monthly * 12;
    const typicalDiscount = annualEstimate * 0.15;
    if (monthly >= 5000) {
      tips.push({
        id: `annual-${sub.id}`,
        type: "annual",
        severity: "low",
        title: `${sub.name} — 연간 결제 검토`,
        description: `월 ₩${Math.round(monthly).toLocaleString()} → 연간 결제 시 약 ₩${Math.round(typicalDiscount).toLocaleString()} 절약 가능 (15% 추정).`,
        savingsAmount: Math.round(typicalDiscount),
        subscriptionIds: [sub.id],
      });
    }
  }

  return tips;
}

function findTopSpender(subs: Subscription[]): SavingsTip | null {
  const active = subs.filter((s) => s.isActive !== false);
  if (active.length < 2) return null;

  const sorted = [...active].sort((a, b) => monthlyAmount(b) - monthlyAmount(a));
  const top = sorted[0];
  const total = active.reduce((s, sub) => s + monthlyAmount(sub), 0);
  const percent = Math.round((monthlyAmount(top) / total) * 100);

  if (percent < 30) return null;

  return {
    id: `top-${top.id}`,
    type: "top_spender",
    severity: "medium",
    title: `최대 지출: ${top.name}`,
    description: `전체 월 지출의 ${percent}%를 차지합니다. 플랜 다운그레이드나 해지를 검토해보세요.`,
    subscriptionIds: [top.id],
  };
}

export function generateSavingsTips(subs: Subscription[]): SavingsTip[] {
  const tips: SavingsTip[] = [
    ...findDuplicates(subs),
    ...findUnused(subs),
    ...findAnnualSavings(subs).slice(0, 2),
  ];

  const top = findTopSpender(subs);
  if (top) tips.push(top);

  const order = { high: 0, medium: 1, low: 2 };
  return tips.sort((a, b) => order[a.severity] - order[b.severity]);
}

export function totalPotentialSavings(tips: SavingsTip[]): number {
  return tips.reduce((sum, t) => sum + (t.savingsAmount ?? 0), 0);
}
