"use client";

import { Target, AlertTriangle } from "lucide-react";
import { useAppStore } from "@/lib/store";
import { getBudgetStatus } from "@/lib/budget";
import { formatMoney } from "@/lib/utils";
import { cn } from "@/lib/utils";

export function BudgetWidget() {
  const { subscriptions, settings, setActiveTab } = useAppStore();
  const status = getBudgetStatus(subscriptions, settings.budget);

  if (!status) {
    return (
      <button
        onClick={() => setActiveTab("settings")}
        className="glass flex w-full items-center gap-3 rounded-2xl p-4 text-left transition hover:border-emerald-300"
      >
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-zinc-100 dark:bg-zinc-800">
          <Target className="h-5 w-5 text-zinc-400" />
        </div>
        <div>
          <p className="text-sm font-medium">월 예산 설정하기</p>
          <p className="text-xs text-zinc-400">한도를 정하고 초과 시 알림을 받으세요</p>
        </div>
      </button>
    );
  }

  return (
    <div
      className={cn(
        "glass rounded-2xl p-4",
        status.isOver && "border border-red-200 dark:border-red-900"
      )}
    >
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Target
            className={cn(
              "h-4 w-4",
              status.isOver ? "text-red-500" : status.isWarning ? "text-amber-500" : "text-emerald-500"
            )}
          />
          <span className="text-sm font-semibold">월 예산</span>
        </div>
        <span className="text-xs text-zinc-400">
          {formatMoney(status.current, "KRW")} / {formatMoney(status.limit, "KRW")}
        </span>
      </div>

      <div className="h-2.5 overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-800">
        <div
          className={cn(
            "h-full rounded-full transition-all duration-500",
            status.isOver ? "bg-red-500" : status.isWarning ? "bg-amber-500" : "bg-emerald-500"
          )}
          style={{ width: `${Math.min(status.percent, 100)}%` }}
        />
      </div>

      <div className="mt-2 flex items-center justify-between text-xs">
        <span
          className={cn(
            "font-medium",
            status.isOver ? "text-red-600" : status.isWarning ? "text-amber-600" : "text-zinc-500"
          )}
        >
          {status.percent}% 사용
        </span>
        {status.isOver ? (
          <span className="flex items-center gap-1 text-red-600">
            <AlertTriangle className="h-3 w-3" />
            ₩{Math.abs(status.remaining).toLocaleString()} 초과
          </span>
        ) : (
          <span className="text-zinc-400">₩{status.remaining.toLocaleString()} 남음</span>
        )}
      </div>
    </div>
  );
}
