import { format, subMonths, startOfMonth } from "date-fns";
import { ko } from "date-fns/locale";
import type { MonthlyReport, Subscription } from "./types";
import { categoryBreakdown, generateId, monthlyAmount, totalMonthly, totalYearly } from "./utils";
import { CATEGORIES } from "./constants";

export function generateMonthlyReport(
  subs: Subscription[],
  prevReport?: MonthlyReport
): MonthlyReport {
  const now = new Date();
  const month = format(startOfMonth(now), "yyyy-MM");
  const active = subs.filter((s) => s.isActive !== false);
  const monthly = totalMonthly(active);
  const yearly = totalYearly(active);

  const sorted = [...active].sort((a, b) => monthlyAmount(b) - monthlyAmount(a));
  const topSubscriptions = sorted.slice(0, 3).map((s) => ({
    name: s.name,
    amount: Math.round(monthlyAmount(s)),
  }));

  const breakdown = categoryBreakdown(active).map((c) => ({
    category: CATEGORIES[c.category as keyof typeof CATEGORIES]?.label ?? c.category,
    amount: Math.round(c.amount),
  }));

  const changeFromPrev = prevReport
    ? monthly - prevReport.totalMonthly
    : undefined;

  return {
    id: generateId(),
    month,
    totalMonthly: Math.round(monthly),
    totalYearly: Math.round(yearly),
    subscriptionCount: active.length,
    topSubscriptions,
    categoryBreakdown: breakdown,
    changeFromPrev: changeFromPrev !== undefined ? Math.round(changeFromPrev) : undefined,
    generatedAt: now.toISOString(),
  };
}

export function formatReportMonth(monthStr: string): string {
  const [year, month] = monthStr.split("-");
  return `${year}년 ${parseInt(month)}월`;
}

export function formatReportDate(iso: string): string {
  return format(new Date(iso), "M월 d일 HH:mm", { locale: ko });
}

export function shouldGenerateReport(
  reports: MonthlyReport[],
  currentMonth: string
): boolean {
  return !reports.some((r) => r.month === currentMonth);
}

export function getPreviousMonthReport(
  reports: MonthlyReport[],
  currentMonth: string
): MonthlyReport | undefined {
  const sorted = [...reports].sort((a, b) => b.month.localeCompare(a.month));
  return sorted.find((r) => r.month < currentMonth);
}

export function buildEmailReportBody(report: MonthlyReport): string {
  const lines = [
    `FlowSave ${formatReportMonth(report.month)} 리포트`,
  "",
    `월 고정비: ₩${report.totalMonthly.toLocaleString()}`,
    `연 예상: ₩${report.totalYearly.toLocaleString()}`,
    `활성 구독: ${report.subscriptionCount}개`,
  ];
  if (report.changeFromPrev !== undefined) {
    const sign = report.changeFromPrev >= 0 ? "+" : "";
    lines.push(`전월 대비: ${sign}₩${report.changeFromPrev.toLocaleString()}`);
  }
  lines.push("", "TOP 3:");
  report.topSubscriptions.forEach((s, i) => {
    lines.push(`${i + 1}. ${s.name} — ₩${s.amount.toLocaleString()}/월`);
  });
  return lines.join("\n");
}

export function openEmailReport(report: MonthlyReport, email: string) {
  const subject = encodeURIComponent(
    `[FlowSave] ${formatReportMonth(report.month)} 구독 리포트`
  );
  const body = encodeURIComponent(buildEmailReportBody(report));
  window.open(`mailto:${email}?subject=${subject}&body=${body}`, "_blank");
}
