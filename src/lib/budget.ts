import type { BudgetSettings, Subscription } from "./types";
import { totalPersonalMonthly } from "./utils";

export interface BudgetStatus {
  current: number;
  limit: number;
  percent: number;
  remaining: number;
  isOver: boolean;
  isWarning: boolean;
}

export function getBudgetStatus(
  subs: Subscription[],
  budget: BudgetSettings
): BudgetStatus | null {
  if (!budget.enabled) return null;

  const current = Math.round(totalPersonalMonthly(subs));
  const limit = budget.monthlyLimitKRW;
  const percent = limit > 0 ? Math.round((current / limit) * 100) : 0;
  const remaining = limit - current;

  return {
    current,
    limit,
    percent: Math.min(percent, 999),
    remaining,
    isOver: current > limit,
    isWarning: percent >= 80 && current <= limit,
  };
}

export function formatBudgetMessage(status: BudgetStatus): string {
  if (status.isOver) {
    return `월 예산 ₩${status.limit.toLocaleString()}을 ₩${(status.current - status.limit).toLocaleString()} 초과했습니다`;
  }
  return `월 구독비 ₩${status.current.toLocaleString()} / ₩${status.limit.toLocaleString()} (${status.percent}%)`;
}
