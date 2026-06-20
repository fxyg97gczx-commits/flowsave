"use client";

import { Plus, ChevronRight, Sparkles } from "lucide-react";
import { StatsOverview } from "./StatsOverview";
import { NextPaymentWidget } from "./NextPaymentWidget";
import { useAppStore } from "@/lib/store";
import { formatMoney, totalPersonalMonthly } from "@/lib/utils";
import type { Subscription } from "@/lib/types";

interface SimpleHomeViewProps {
  onAdd: () => void;
  onEdit: (sub: Subscription) => void;
}

export function SimpleHomeView({ onAdd, onEdit }: SimpleHomeViewProps) {
  const { subscriptions, familyMembers, setShowFullHome, setActiveTab } = useAppStore();
  const active = subscriptions.filter((s) => s.isActive !== false);
  const monthly = totalPersonalMonthly(active);

  return (
    <div className="space-y-5">
      <div className="glass rounded-2xl p-6 text-center">
        <p className="text-sm text-zinc-500">이번 달 구독·고정비</p>
        <p className="mt-1 text-4xl font-bold tracking-tight text-emerald-600">
          {formatMoney(monthly, "KRW")}
        </p>
        <p className="mt-2 text-xs text-zinc-400">
          {active.length}개 구독 · 매달 자동 계산
        </p>
      </div>

      {active.length > 0 && (
        <NextPaymentWidget
          subscriptions={active}
          onSelect={onEdit}
          onViewAll={() => setActiveTab("subscriptions")}
        />
      )}

      <button
        onClick={onAdd}
        className="flex w-full items-center justify-center gap-2 rounded-2xl gradient-brand py-4 text-base font-semibold text-white shadow-lg shadow-emerald-500/25"
      >
        <Plus className="h-5 w-5" />
        구독 추가하기
      </button>

      {active.length === 0 && (
        <div className="rounded-2xl border border-dashed border-zinc-200 p-6 text-center dark:border-zinc-700">
          <p className="text-sm text-zinc-500">아직 등록된 구독이 없어요</p>
          <p className="mt-1 text-xs text-zinc-400">
            Netflix, Spotify, iCloud 등을 추가해 보세요
          </p>
        </div>
      )}

      {active.length > 0 && active.length < 4 && (
        <StatsOverview subscriptions={subscriptions} familyMembers={familyMembers} />
      )}

      <button
        onClick={() => setShowFullHome(true)}
        className="flex w-full items-center justify-center gap-1 py-2 text-sm font-medium text-zinc-500 hover:text-emerald-600"
      >
        <Sparkles className="h-4 w-4" />
        전체 대시보드 보기
        <ChevronRight className="h-4 w-4" />
      </button>
    </div>
  );
}
