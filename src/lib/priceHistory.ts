import type { Currency, PriceHistoryEntry, Subscription } from "./types";
import { formatMoney, toKRW } from "./utils";
import { format } from "date-fns";
import { ko } from "date-fns/locale";

export function recordPriceChange(
  sub: Subscription,
  newAmount: number,
  newCurrency?: Currency
): PriceHistoryEntry[] {
  const history = sub.priceHistory ?? [];
  if (sub.amount === newAmount && (!newCurrency || newCurrency === sub.currency)) {
    return history;
  }
  const entry: PriceHistoryEntry = {
    amount: sub.amount,
    currency: sub.currency,
    recordedAt: new Date().toISOString(),
  };
  return [entry, ...history].slice(0, 30);
}

export function getLatestPriceChange(sub: Subscription): {
  diff: number;
  percent: number;
  increased: boolean;
} | null {
  const history = sub.priceHistory;
  if (!history || history.length === 0) return null;

  const prev = history[0];
  const prevKRW = toKRW(prev.amount, prev.currency);
  const currKRW = toKRW(sub.amount, sub.currency);
  const diff = currKRW - prevKRW;
  if (diff === 0) return null;

  return {
    diff,
    percent: Math.round((diff / prevKRW) * 100),
    increased: diff > 0,
  };
}

export function formatPriceChange(sub: Subscription): string | null {
  const change = getLatestPriceChange(sub);
  if (!change) return null;
  const sign = change.increased ? "+" : "";
  return `${sign}₩${Math.abs(change.diff).toLocaleString()} (${sign}${change.percent}%)`;
}

export function formatHistoryDate(iso: string): string {
  return format(new Date(iso), "yyyy.M.d", { locale: ko });
}

export function formatHistoryAmount(amount: number, currency: Currency): string {
  return formatMoney(amount, currency);
}
