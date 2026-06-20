"use client";

import {
  Pencil, Trash2, MoreVertical, Users, Pause, Play, Check,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import {
  formatMoney,
  monthlyAmount,
  personalMonthlyAmount,
  daysUntilRenewal,
  cn,
} from "@/lib/utils";
import { CATEGORIES, BILLING_CYCLES } from "@/lib/constants";
import { daysUntilTrialEnd } from "@/lib/calendar";
import { PriceChangeBadge } from "./PriceHistoryModal";
import type { Subscription } from "@/lib/types";

interface SubscriptionCardProps {
  subscription: Subscription;
  onEdit: (sub: Subscription) => void;
  onDelete: (id: string) => void;
  onMarkUsed?: (id: string) => void;
  onToggleActive?: (id: string) => void;
  onShowPriceHistory?: (sub: Subscription) => void;
}

export function SubscriptionCard({
  subscription: sub,
  onEdit,
  onDelete,
  onMarkUsed,
  onToggleActive,
  onShowPriceHistory,
}: SubscriptionCardProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const daysLeft = daysUntilRenewal(sub);
  const trialDays = daysUntilTrialEnd(sub);
  const monthly = monthlyAmount(sub);
  const personal = personalMonthlyAmount(sub);
  const inactive = sub.isActive === false;

  useEffect(() => {
    if (!menuOpen) return;

    const handleOutside = (event: MouseEvent | TouchEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMenuOpen(false);
    };

    document.addEventListener("mousedown", handleOutside);
    document.addEventListener("touchstart", handleOutside);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handleOutside);
      document.removeEventListener("touchstart", handleOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [menuOpen]);

  return (
    <div
      className={cn(
        "group glass animate-fade-in relative rounded-2xl p-4 transition hover:shadow-xl",
        inactive && "opacity-50",
        menuOpen && "z-50"
      )}
    >
      <div className="flex items-start gap-3">
        <div
          className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl text-xl"
          style={{ backgroundColor: `${sub.color}18` }}
        >
          {CATEGORIES[sub.category].emoji}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <div>
              <div className="flex items-center gap-1.5">
                <h3 className="font-semibold leading-tight">{sub.name}</h3>
                {inactive && (
                  <span className="rounded bg-zinc-200 px-1.5 py-0.5 text-[9px] font-medium dark:bg-zinc-700">
                    일시정지
                  </span>
                )}
                {sub.isTrial && trialDays !== null && trialDays >= 0 && (
                  <span className="rounded bg-violet-100 px-1.5 py-0.5 text-[9px] font-medium text-violet-600 dark:bg-violet-950/50 dark:text-violet-400">
                    체험 D-{trialDays}
                  </span>
                )}
                {onShowPriceHistory && (
                  <PriceChangeBadge subscription={sub} onClick={() => onShowPriceHistory(sub)} />
                )}
              </div>
              <p className="mt-0.5 text-xs text-zinc-500">
                {CATEGORIES[sub.category].label} · {BILLING_CYCLES[sub.billingCycle].label}
                {sub.isShared && (
                  <span className="ml-1 text-blue-500">
                    <Users className="inline h-3 w-3" /> {sub.mySharePercent}%
                  </span>
                )}
              </p>
            </div>
            <div className="relative" ref={menuRef}>
              <button
                type="button"
                onClick={() => setMenuOpen((open) => !open)}
                aria-label="더보기 메뉴"
                aria-expanded={menuOpen}
                className={cn(
                  "flex h-8 w-8 items-center justify-center rounded-lg text-zinc-500 transition hover:bg-zinc-100 hover:text-zinc-700 dark:hover:bg-zinc-800 dark:hover:text-zinc-200",
                  menuOpen && "bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-200"
                )}
              >
                <MoreVertical className="h-4 w-4" />
              </button>
              {menuOpen && (
                <>
                  <div
                    className="fixed inset-0 z-[60]"
                    aria-hidden="true"
                    onClick={() => setMenuOpen(false)}
                  />
                  <div className="absolute right-0 z-[70] mt-1 w-40 rounded-xl border border-zinc-200 bg-white py-1 shadow-lg dark:border-zinc-700 dark:bg-zinc-800">
                    {onMarkUsed && (
                      <button
                        type="button"
                        onClick={() => { onMarkUsed(sub.id); setMenuOpen(false); }}
                        className="flex w-full items-center gap-2 px-3 py-2 text-sm hover:bg-zinc-50 dark:hover:bg-zinc-700"
                      >
                        <Check className="h-3.5 w-3.5" /> 사용함
                      </button>
                    )}
                    {onToggleActive && (
                      <button
                        type="button"
                        onClick={() => { onToggleActive(sub.id); setMenuOpen(false); }}
                        className="flex w-full items-center gap-2 px-3 py-2 text-sm hover:bg-zinc-50 dark:hover:bg-zinc-700"
                      >
                        {inactive ? <Play className="h-3.5 w-3.5" /> : <Pause className="h-3.5 w-3.5" />}
                        {inactive ? "재개" : "일시정지"}
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => { onEdit(sub); setMenuOpen(false); }}
                      className="flex w-full items-center gap-2 px-3 py-2 text-sm hover:bg-zinc-50 dark:hover:bg-zinc-700"
                    >
                      <Pencil className="h-3.5 w-3.5" /> 수정
                    </button>
                    <button
                      type="button"
                      onClick={() => { onDelete(sub.id); setMenuOpen(false); }}
                      className="flex w-full items-center gap-2 px-3 py-2 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30"
                    >
                      <Trash2 className="h-3.5 w-3.5" /> 삭제
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>

          <div className="mt-3 flex items-end justify-between">
            <div>
              <p className="text-lg font-bold">{formatMoney(sub.amount, sub.currency)}</p>
              <p className="text-xs text-zinc-400">
                {sub.isShared
                  ? `내 몫 월 ${formatMoney(personal, "KRW")}`
                  : `월 ${formatMoney(monthly, "KRW")} 환산`}
              </p>
            </div>
            {!inactive && (
              <span
                className={cn(
                  "rounded-full px-2.5 py-1 text-xs font-medium",
                  daysLeft <= 3 ? "bg-red-100 text-red-600 dark:bg-red-950/50 dark:text-red-400" :
                  daysLeft <= 7 ? "bg-amber-100 text-amber-600 dark:bg-amber-950/50 dark:text-amber-400" :
                  "bg-zinc-100 text-zinc-500 dark:bg-zinc-800"
                )}
              >
                D-{daysLeft}
              </span>
            )}
          </div>
        </div>
      </div>

      <div
        className="absolute bottom-0 left-4 right-4 h-0.5 rounded-full opacity-60"
        style={{ backgroundColor: sub.color }}
      />
    </div>
  );
}
