"use client";

import { Plus, Search, ClipboardPaste } from "lucide-react";
import { Wallet } from "lucide-react";

interface EmptyStateProps {
  onAdd: () => void;
  onLoadSamples: () => void;
  onParse?: () => void;
}

export function EmptyState({ onAdd, onLoadSamples, onParse }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-3xl gradient-brand shadow-xl shadow-emerald-500/20">
        <Wallet className="h-10 w-10 text-white" />
      </div>
      <h2 className="text-xl font-bold">구독이 없습니다</h2>
      <p className="mt-2 max-w-sm text-sm text-zinc-500">
        Netflix, Spotify, iCloud 등 반복 결제를 등록하고
        <br />
        매달 나가는 돈을 한눈에 파악하세요.
      </p>
      <div className="mt-6 flex flex-col gap-3 sm:flex-row">
        <button
          onClick={onAdd}
          className="flex items-center justify-center gap-2 rounded-xl gradient-brand px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-emerald-500/25"
        >
          <Plus className="h-4 w-4" />
          첫 구독 추가하기
        </button>
        {onParse && (
          <button
            onClick={onParse}
            className="flex items-center justify-center gap-2 rounded-xl border border-emerald-200 px-6 py-3 text-sm font-medium text-emerald-700 dark:border-emerald-800 dark:text-emerald-400"
          >
            <ClipboardPaste className="h-4 w-4" />
            문자로 등록
          </button>
        )}
        <button
          onClick={onLoadSamples}
          className="flex items-center justify-center gap-2 rounded-xl border border-zinc-200 px-6 py-3 text-sm font-medium text-zinc-600 transition hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
        >
          <Search className="h-4 w-4" />
          샘플 데이터로 체험
        </button>
      </div>
    </div>
  );
}
