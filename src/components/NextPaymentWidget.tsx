"use client";

import { Calendar, ChevronRight } from "lucide-react";
import { getUpcomingRenewals, formatMoney, formatRenewalDate } from "@/lib/utils";
import type { Subscription } from "@/lib/types";
import { cn } from "@/lib/utils";

interface NextPaymentWidgetProps {
  subscriptions: Subscription[];
  onViewAll?: () => void;
  onSelect?: (sub: Subscription) => void;
}

export function NextPaymentWidget({ subscriptions, onViewAll, onSelect }: NextPaymentWidgetProps) {
  const upcoming = getUpcomingRenewals(subscriptions, 14);
  const next = upcoming[0];

  if (!next) {
    return (
      <div className="glass rounded-2xl p-4">
        <div className="flex items-center gap-2 text-sm text-zinc-400">
          <Calendar className="h-4 w-4" />
          14일 이내 결제 예정 없음
        </div>
      </div>
    );
  }

  const urgent = next.daysLeft <= 3;

  const handleClick = () => {
    if (onSelect) {
      onSelect(next.sub);
    } else {
      onViewAll?.();
    }
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      className={cn(
        "w-full rounded-2xl p-4 text-left transition hover:scale-[1.01] active:scale-[0.99]",
        urgent
          ? "bg-gradient-to-r from-red-500 to-orange-500 text-white shadow-lg shadow-red-500/20"
          : "glass"
      )}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Calendar className={cn("h-4 w-4", urgent ? "text-white/80" : "text-emerald-500")} />
          <span className={cn("text-xs font-medium", urgent ? "text-white/80" : "text-zinc-500")}>
            다음 결제
          </span>
        </div>
        <ChevronRight className={cn("h-4 w-4", urgent ? "text-white/60" : "text-zinc-300")} />
      </div>
      <div className="mt-2 flex items-end justify-between">
        <div>
          <p className={cn("text-lg font-bold", !urgent && "text-zinc-900 dark:text-zinc-100")}>
            {next.sub.name}
          </p>
          <p className={cn("text-xs", urgent ? "text-white/70" : "text-zinc-400")}>
            {formatRenewalDate(next.nextDate)}
          </p>
        </div>
        <div className="text-right">
          <p className={cn("text-xl font-bold", !urgent && "text-emerald-600")}>
            {formatMoney(next.sub.amount, next.sub.currency)}
          </p>
          <p className={cn("text-xs font-semibold", urgent ? "text-white/80" : "text-amber-500")}>
            D-{next.daysLeft}
          </p>
        </div>
      </div>
      {upcoming.length > 1 && (
        <p className={cn("mt-2 text-xs", urgent ? "text-white/60" : "text-zinc-400")}>
          +{upcoming.length - 1}건 더 예정 · 탭하여 상세 보기
        </p>
      )}
    </button>
  );
}
