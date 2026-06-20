import { format, addDays, parseISO, differenceInDays } from "date-fns";
import type { Subscription } from "./types";
import { nextRenewalDate, formatMoney } from "./utils";
import { BILLING_CYCLES } from "./constants";

function icsEscape(text: string): string {
  return text.replace(/\\/g, "\\\\").replace(/;/g, "\\;").replace(/,/g, "\\,").replace(/\n/g, "\\n");
}

function toICSDate(date: Date): string {
  return format(date, "yyyyMMdd");
}

export function daysUntilTrialEnd(sub: Subscription): number | null {
  if (!sub.isTrial || !sub.trialEndsAt) return null;
  return differenceInDays(parseISO(sub.trialEndsAt), new Date());
}

export function generateICS(subs: Subscription[]): string {
  const active = subs.filter((s) => s.isActive !== false);
  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//FlowSave//KO",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "X-WR-CALNAME:FlowSave 구독 결제일",
  ];

  for (const sub of active) {
    const next = nextRenewalDate(sub.renewalDate, sub.billingCycle);
    const end = addDays(next, 1);
    const uid = `flowsave-${sub.id}-${toICSDate(next)}@flowsave.app`;
    const amount = formatMoney(sub.amount, sub.currency);
    const cycle = BILLING_CYCLES[sub.billingCycle].label;

    lines.push(
      "BEGIN:VEVENT",
      `UID:${uid}`,
      `DTSTAMP:${format(new Date(), "yyyyMMdd'T'HHmmss'Z'")}`,
      `DTSTART;VALUE=DATE:${toICSDate(next)}`,
      `DTEND;VALUE=DATE:${toICSDate(end)}`,
      `SUMMARY:${icsEscape(`${sub.name} 결제`)}`,
      `DESCRIPTION:${icsEscape(`${amount} · ${cycle}${sub.isTrial ? " · 무료체험" : ""}`)}`,
      "BEGIN:VALARM",
      "TRIGGER:-P1D",
      "ACTION:DISPLAY",
      `DESCRIPTION:${icsEscape(`${sub.name} 내일 결제`)}`,
      "END:VALARM",
      "END:VEVENT"
    );

    if (sub.isTrial && sub.trialEndsAt) {
      const trialEnd = parseISO(sub.trialEndsAt);
      const trialEndNext = addDays(trialEnd, 1);
      lines.push(
        "BEGIN:VEVENT",
        `UID:flowsave-trial-${sub.id}@flowsave.app`,
        `DTSTAMP:${format(new Date(), "yyyyMMdd'T'HHmmss'Z'")}`,
        `DTSTART;VALUE=DATE:${toICSDate(trialEnd)}`,
        `DTEND;VALUE=DATE:${toICSDate(trialEndNext)}`,
        `SUMMARY:${icsEscape(`${sub.name} 무료체험 종료`)}`,
        `DESCRIPTION:${icsEscape("해지하지 않으면 자동 결제됩니다")}`,
        "BEGIN:VALARM",
        "TRIGGER:-P1D",
        "ACTION:DISPLAY",
        `DESCRIPTION:${icsEscape(`${sub.name} 체험 내일 종료`)}`,
        "END:VALARM",
        "END:VEVENT"
      );
    }
  }

  lines.push("END:VCALENDAR");
  return lines.join("\r\n");
}

export function downloadICS(subs: Subscription[], filename = "flowsave-subscriptions.ics") {
  const content = generateICS(subs);
  const blob = new Blob([content], { type: "text/calendar;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export function googleCalendarUrl(sub: Subscription): string {
  const next = nextRenewalDate(sub.renewalDate, sub.billingCycle);
  const end = addDays(next, 1);
  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: `${sub.name} 결제`,
    dates: `${toICSDate(next)}/${toICSDate(end)}`,
    details: `${formatMoney(sub.amount, sub.currency)} · ${BILLING_CYCLES[sub.billingCycle].label}`,
  });
  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

export function googleCalendarTrialUrl(sub: Subscription): string | null {
  if (!sub.isTrial || !sub.trialEndsAt) return null;
  const end = parseISO(sub.trialEndsAt);
  const endNext = addDays(end, 1);
  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: `${sub.name} 무료체험 종료`,
    dates: `${toICSDate(end)}/${toICSDate(endNext)}`,
    details: "해지하지 않으면 자동 결제됩니다. FlowSave에서 확인하세요.",
  });
  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

export function getUpcomingTrials(subs: Subscription[], withinDays = 14) {
  return subs
    .filter((s) => s.isTrial && s.trialEndsAt && s.isActive !== false)
    .map((sub) => ({
      sub,
      daysLeft: daysUntilTrialEnd(sub) ?? 999,
      endDate: parseISO(sub.trialEndsAt!),
    }))
    .filter((t) => t.daysLeft >= 0 && t.daysLeft <= withinDays)
    .sort((a, b) => a.daysLeft - b.daysLeft);
}
