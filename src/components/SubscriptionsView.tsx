"use client";

import { useState, useMemo, Fragment } from "react";
import { Search, Filter, ClipboardPaste, Plus } from "lucide-react";
import { SubscriptionCard } from "./SubscriptionCard";
import { EmptyState } from "./EmptyState";
import { NativeAdCard } from "./AdBanner";
import { useAppStore } from "@/lib/store";
import { CATEGORIES } from "@/lib/constants";
import type { Subscription } from "@/lib/types";

interface SubscriptionsViewProps {
  onAdd: () => void;
  onParse: () => void;
  onEdit: (sub: Subscription) => void;
  onShowPriceHistory: (sub: Subscription) => void;
}

export function SubscriptionsView({ onAdd, onParse, onEdit, onShowPriceHistory }: SubscriptionsViewProps) {
  const {
    subscriptions,
    deleteSubscription,
    markUsed,
    toggleActive,
    loadSamples,
  } = useAppStore();

  const [search, setSearch] = useState("");
  const [filterCategory, setFilterCategory] = useState("all");
  const [showInactive, setShowInactive] = useState(false);

  const filtered = useMemo(() => {
    return subscriptions.filter((s) => {
      const matchSearch = s.name.toLowerCase().includes(search.toLowerCase());
      const matchCategory = filterCategory === "all" || s.category === filterCategory;
      const matchActive = showInactive || s.isActive !== false;
      return matchSearch && matchCategory && matchActive;
    });
  }, [subscriptions, search, filterCategory, showInactive]);

  if (subscriptions.length === 0) {
    return <EmptyState onAdd={onAdd} onLoadSamples={loadSamples} onParse={onParse} />;
  }

  return (
    <div>
      <button
        onClick={onParse}
        className="mb-4 flex w-full items-center justify-center gap-2 rounded-2xl border border-emerald-200 bg-emerald-50 py-3 text-sm font-medium text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-400"
      >
        <ClipboardPaste className="h-4 w-4" />
        문자/이메일로 빠르게 등록
      </button>

      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-lg font-bold">내 구독 ({subscriptions.length})</h2>
        <button
          onClick={onAdd}
          className="flex items-center gap-1.5 rounded-xl gradient-brand px-3 py-2 text-xs font-semibold text-white shadow-md"
        >
          <Plus className="h-3.5 w-3.5" />
          추가
        </button>
      </div>

      <div className="mb-4 flex flex-wrap items-center gap-2">
        <div className="relative flex-1 sm:flex-none">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="검색..."
            className="w-full rounded-xl border border-zinc-200 bg-white py-2 pl-9 pr-4 text-sm outline-none focus:border-emerald-500 dark:border-zinc-700 dark:bg-zinc-800 sm:w-48"
          />
        </div>
        <div className="relative">
          <Filter className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="appearance-none rounded-xl border border-zinc-200 bg-white py-2 pl-9 pr-8 text-sm outline-none dark:border-zinc-700 dark:bg-zinc-800"
          >
            <option value="all">전체</option>
            {Object.entries(CATEGORIES).map(([k, v]) => (
              <option key={k} value={k}>{v.emoji} {v.label}</option>
            ))}
          </select>
        </div>
        <label className="flex items-center gap-1.5 text-xs text-zinc-500">
          <input
            type="checkbox"
            checked={showInactive}
            onChange={(e) => setShowInactive(e.target.checked)}
            className="accent-emerald-500"
          />
          일시정지 포함
        </label>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((sub, index) => (
          <Fragment key={sub.id}>
            <SubscriptionCard
              subscription={sub}
              onEdit={onEdit}
              onDelete={deleteSubscription}
              onMarkUsed={markUsed}
              onToggleActive={toggleActive}
              onShowPriceHistory={onShowPriceHistory}
            />
            {index === 2 && filtered.length > 3 && (
              <NativeAdCard placement="list-native" className="sm:col-span-2 lg:col-span-1" />
            )}
          </Fragment>
        ))}
      </div>

      {filtered.length === 0 && (
        <p className="py-8 text-center text-sm text-zinc-400">검색 결과가 없습니다</p>
      )}
    </div>
  );
}
