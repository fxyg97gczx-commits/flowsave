"use client";

import { useState } from "react";
import { TrendingUp, TrendingDown, History, X } from "lucide-react";
import type { Subscription } from "@/lib/types";
import {
  formatHistoryAmount,
  formatHistoryDate,
  getLatestPriceChange,
} from "@/lib/priceHistory";
import { cn } from "@/lib/utils";

interface PriceHistoryModalProps {
  subscription: Subscription | null;
  onClose: () => void;
}

export function PriceHistoryModal({ subscription, onClose }: PriceHistoryModalProps) {
  if (!subscription) return null;

  const change = getLatestPriceChange(subscription);
  const history = subscription.priceHistory ?? [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-10 w-full max-w-sm rounded-2xl bg-white p-5 shadow-2xl dark:bg-zinc-900">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <History className="h-5 w-5 text-emerald-500" />
            <h3 className="font-bold">{subscription.name} 가격 이력</h3>
          </div>
          <button onClick={onClose} className="rounded-lg p-1 hover:bg-zinc-100 dark:hover:bg-zinc-800">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="mb-4 rounded-xl bg-zinc-50 p-4 dark:bg-zinc-800/50">
          <p className="text-xs text-zinc-400">현재 가격</p>
          <p className="text-2xl font-bold">
            {formatHistoryAmount(subscription.amount, subscription.currency)}
          </p>
          {change && (
            <p
              className={cn(
                "mt-1 flex items-center gap-1 text-sm font-medium",
                change.increased ? "text-red-500" : "text-emerald-500"
              )}
            >
              {change.increased ? (
                <TrendingUp className="h-4 w-4" />
              ) : (
                <TrendingDown className="h-4 w-4" />
              )}
              {change.increased ? "+" : ""}₩{Math.abs(change.diff).toLocaleString()}
              ({change.increased ? "+" : ""}{change.percent}%)
            </p>
          )}
        </div>

        {history.length === 0 ? (
          <p className="py-4 text-center text-sm text-zinc-400">가격 변동 기록이 없습니다</p>
        ) : (
          <div className="max-h-48 space-y-2 overflow-y-auto">
            {history.map((entry, i) => (
              <div
                key={`${entry.recordedAt}-${i}`}
                className="flex items-center justify-between rounded-lg border border-zinc-100 px-3 py-2 dark:border-zinc-800"
              >
                <span className="text-sm">
                  {formatHistoryAmount(entry.amount, entry.currency)}
                </span>
                <span className="text-xs text-zinc-400">{formatHistoryDate(entry.recordedAt)}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export function PriceChangeBadge({
  subscription,
  onClick,
}: {
  subscription: Subscription;
  onClick: () => void;
}) {
  const change = getLatestPriceChange(subscription);
  if (!change) return null;

  return (
    <button
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      className={cn(
        "inline-flex items-center gap-0.5 rounded-full px-1.5 py-0.5 text-[10px] font-medium",
        change.increased
          ? "bg-red-100 text-red-600 dark:bg-red-950/50 dark:text-red-400"
          : "bg-emerald-100 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400"
      )}
    >
      {change.increased ? <TrendingUp className="h-2.5 w-2.5" /> : <TrendingDown className="h-2.5 w-2.5" />}
      {change.increased ? "+" : ""}{change.percent}%
    </button>
  );
}
