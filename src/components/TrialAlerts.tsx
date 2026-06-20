"use client";

import { Clock, AlertTriangle } from "lucide-react";
import { getUpcomingTrials } from "@/lib/calendar";
import { formatMoney } from "@/lib/utils";
import type { Subscription } from "@/lib/types";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { ko } from "date-fns/locale";

interface TrialAlertsProps {
  subscriptions: Subscription[];
}

export function TrialAlerts({ subscriptions }: TrialAlertsProps) {
  const trials = getUpcomingTrials(subscriptions, 14);

  if (trials.length === 0) return null;

  return (
    <div className="glass rounded-2xl p-4">
      <div className="mb-3 flex items-center gap-2">
        <Clock className="h-4 w-4 text-violet-500" />
        <h3 className="text-sm font-semibold">무료 체험 종료 예정</h3>
        <span className="ml-auto text-xs text-zinc-400">{trials.length}건</span>
      </div>

      <div className="space-y-2">
        {trials.map(({ sub, daysLeft, endDate }) => (
          <div
            key={sub.id}
            className={cn(
              "flex items-center gap-3 rounded-xl p-3",
              daysLeft <= 1
                ? "bg-red-50 dark:bg-red-950/20"
                : "bg-violet-50/50 dark:bg-violet-950/20"
            )}
          >
            <div
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-lg"
              style={{ backgroundColor: `${sub.color}20` }}
            >
              ⏳
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate font-medium">{sub.name}</p>
              <p className="text-xs text-zinc-500">
                {format(endDate, "M월 d일", { locale: ko })} 종료
                {daysLeft <= 1 && (
                  <span className="ml-1 text-red-500">· 자동결제 주의</span>
                )}
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm font-bold">{formatMoney(sub.amount, sub.currency)}</p>
              <p
                className={cn(
                  "text-xs font-semibold",
                  daysLeft <= 1 ? "text-red-500" : "text-violet-500"
                )}
              >
                {daysLeft === 0 ? (
                  <span className="flex items-center gap-0.5">
                    <AlertTriangle className="h-3 w-3" /> 오늘
                  </span>
                ) : (
                  `D-${daysLeft}`
                )}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
