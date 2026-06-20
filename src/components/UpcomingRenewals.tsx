"use client";

import { Bell, ChevronRight } from "lucide-react";
import { getUpcomingRenewals, formatRenewalDate, formatMoney } from "@/lib/utils";
import { CATEGORIES, BILLING_CYCLES } from "@/lib/constants";
import type { Subscription } from "@/lib/types";

interface UpcomingRenewalsProps {
  subscriptions: Subscription[];
  onSelect?: (sub: Subscription) => void;
}

export function UpcomingRenewals({ subscriptions, onSelect }: UpcomingRenewalsProps) {
  const upcoming = getUpcomingRenewals(subscriptions, 30);

  return (
    <div className="glass rounded-2xl p-5">
      <div className="mb-4 flex items-center gap-2">
        <Bell className="h-4 w-4 text-amber-500" />
        <h3 className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">
          다가오는 결제
        </h3>
        <span className="ml-auto text-xs text-zinc-400">30일 이내</span>
      </div>

      {upcoming.length === 0 ? (
        <p className="py-6 text-center text-sm text-zinc-400">
          30일 이내 결제 예정이 없습니다
        </p>
      ) : (
        <div className="space-y-2">
          {upcoming.slice(0, 5).map(({ sub, nextDate, daysLeft }) => (
            <button
              key={sub.id}
              type="button"
              onClick={() => onSelect?.(sub)}
              className="flex w-full items-center gap-3 rounded-xl bg-zinc-50 p-3 text-left transition hover:bg-zinc-100 active:scale-[0.99] dark:bg-zinc-800/50 dark:hover:bg-zinc-800"
            >
              <div
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-lg"
                style={{ backgroundColor: `${sub.color}20` }}
              >
                {CATEGORIES[sub.category].emoji}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate font-medium">{sub.name}</p>
                <p className="text-xs text-zinc-500">
                  {formatRenewalDate(nextDate)} · {BILLING_CYCLES[sub.billingCycle].label}
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm font-semibold">
                  {formatMoney(sub.amount, sub.currency)}
                </p>
                <p
                  className={`text-xs font-medium ${
                    daysLeft <= 3
                      ? "text-red-500"
                      : daysLeft <= 7
                        ? "text-amber-500"
                        : "text-zinc-400"
                  }`}
                >
                  D-{daysLeft}
                </p>
              </div>
              <ChevronRight className="h-4 w-4 shrink-0 text-zinc-300" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
