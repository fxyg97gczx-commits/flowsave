"use client";

import { AlertTriangle, Lightbulb, TrendingDown, Copy, Ban, Calendar } from "lucide-react";
import { generateSavingsTips, totalPotentialSavings } from "@/lib/savings";
import { formatMoney } from "@/lib/utils";
import type { Subscription } from "@/lib/types";
import { cn } from "@/lib/utils";

const TYPE_ICONS = {
  duplicate: Copy,
  unused: Ban,
  annual: Calendar,
  top_spender: TrendingDown,
  category: Lightbulb,
};

const SEVERITY_STYLES = {
  high: "border-red-200 bg-red-50/50 dark:border-red-900 dark:bg-red-950/20",
  medium: "border-amber-200 bg-amber-50/50 dark:border-amber-900 dark:bg-amber-950/20",
  low: "border-blue-200 bg-blue-50/50 dark:border-blue-900 dark:bg-blue-950/20",
};

interface SavingsInsightProps {
  subscriptions: Subscription[];
}

export function SavingsInsight({ subscriptions }: SavingsInsightProps) {
  const tips = generateSavingsTips(subscriptions);
  const totalSavings = totalPotentialSavings(tips);

  if (tips.length === 0) {
    return (
      <div className="glass rounded-2xl p-5 text-center">
        <Lightbulb className="mx-auto mb-2 h-8 w-8 text-emerald-400" />
        <p className="text-sm font-medium text-emerald-600">구독 상태 양호!</p>
        <p className="mt-1 text-xs text-zinc-400">현재 절약 제안이 없습니다</p>
      </div>
    );
  }

  return (
    <div className="glass rounded-2xl p-5">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Lightbulb className="h-4 w-4 text-amber-500" />
          <h3 className="text-sm font-semibold">절약 인사이트</h3>
        </div>
        {totalSavings > 0 && (
          <span className="rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-bold text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400">
            최대 ₩{totalSavings.toLocaleString()}/년 절약 가능
          </span>
        )}
      </div>

      <div className="space-y-2">
        {tips.map((tip) => {
          const Icon = TYPE_ICONS[tip.type] ?? Lightbulb;
          return (
            <div
              key={tip.id}
              className={cn("rounded-xl border p-3", SEVERITY_STYLES[tip.severity])}
            >
              <div className="flex items-start gap-3">
                <Icon
                  className={cn(
                    "mt-0.5 h-4 w-4 shrink-0",
                    tip.severity === "high" ? "text-red-500" :
                    tip.severity === "medium" ? "text-amber-500" : "text-blue-500"
                  )}
                />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium">{tip.title}</p>
                    {tip.severity === "high" && (
                      <AlertTriangle className="h-3 w-3 text-red-500" />
                    )}
                  </div>
                  <p className="mt-0.5 text-xs text-zinc-500">{tip.description}</p>
                  {tip.savingsAmount && tip.savingsAmount > 0 && (
                    <p className="mt-1 text-xs font-semibold text-emerald-600">
                      절약 가능: {formatMoney(tip.savingsAmount, "KRW")}
                      {tip.type === "annual" ? "/년" : tip.type === "unused" ? "/년" : ""}
                    </p>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
