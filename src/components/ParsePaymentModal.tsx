"use client";

import { useMemo, useState } from "react";
import {
  ClipboardPaste,
  Sparkles,
  AlertCircle,
  Check,
  ArrowRight,
  RefreshCw,
} from "lucide-react";
import {
  parsePaymentText,
  findMatchingSubscription,
  isPaymentAmountDifferent,
} from "@/lib/parser";
import { PARSE_EXAMPLES, PRO_AVAILABLE } from "@/lib/constants";
import { CATEGORIES, COLORS } from "@/lib/constants";
import { defaultRenewalDate, formatMoney } from "@/lib/utils";
import type { ParsedPayment } from "@/lib/types";
import { cn } from "@/lib/utils";
import { useAppStore } from "@/lib/store";

interface ParsePaymentModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (parsed: ParsedPayment) => void;
  onUpdatePrice: (subscriptionId: string, parsed: ParsedPayment) => void;
  isPremium: boolean;
  onNeedPro?: () => void;
}

export function ParsePaymentModal({
  open,
  onClose,
  onSave,
  onUpdatePrice,
  isPremium,
  onNeedPro,
}: ParsePaymentModalProps) {
  const subscriptions = useAppStore((s) => s.subscriptions);
  const [text, setText] = useState("");
  const [parsed, setParsed] = useState<ParsedPayment | null>(null);

  const matchedSub = useMemo(
    () => (parsed ? findMatchingSubscription(parsed, subscriptions) : null),
    [parsed, subscriptions]
  );

  const priceChanged = matchedSub && parsed
    ? isPaymentAmountDifferent(matchedSub, parsed)
    : false;

  if (!open) return null;

  const reset = () => {
    setText("");
    setParsed(null);
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const handleParse = () => {
    setParsed(parsePaymentText(text));
  };

  const handlePaste = async () => {
    try {
      const clip = await navigator.clipboard.readText();
      setText(clip);
      setParsed(parsePaymentText(clip));
    } catch {
      setText("");
    }
  };

  const handleSave = () => {
    if (!parsed) return;
    if (!isPremium || !PRO_AVAILABLE) {
      onNeedPro?.();
      return;
    }
    onSave(parsed);
    reset();
    onClose();
  };

  const handleUpdatePrice = () => {
    if (!parsed || !matchedSub) return;
    onUpdatePrice(matchedSub.id, parsed);
    reset();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center" role="dialog" aria-modal="true">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={handleClose} />
      <div className="animate-slide-up relative z-10 max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-t-3xl bg-white p-6 shadow-2xl dark:bg-zinc-900 sm:rounded-3xl">
        <div className="mb-4 flex items-center gap-2">
          <ClipboardPaste className="h-5 w-5 text-emerald-500" />
          <h2 className="text-lg font-bold">문자/이메일 자동 등록</h2>
          {!isPremium && (
            <span className="flex items-center gap-0.5 rounded-full bg-zinc-100 px-2 py-0.5 text-xs font-medium text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400">
              준비 중
            </span>
          )}
        </div>

        <p className="mb-4 text-xs text-zinc-500">
          카드 결제 문자를 붙여넣으면 서비스와 금액을 인식합니다.
          등록된 구독과 금액이 다르면 <strong>가격 업데이트</strong>를 제안해 드려요.
          {!isPremium && " (신규 등록은 추후 공개, 가격 업데이트는 무료)"}
        </p>

        <div className="mb-3 flex gap-2">
          <button
            onClick={handlePaste}
            className="flex items-center gap-1.5 rounded-xl border border-zinc-200 px-3 py-2 text-xs font-medium transition hover:bg-zinc-50 dark:border-zinc-700 dark:hover:bg-zinc-800"
          >
            <ClipboardPaste className="h-3.5 w-3.5" />
            클립보드 붙여넣기
          </button>
        </div>

        <textarea
          value={text}
          onChange={(e) => {
            setText(e.target.value);
            setParsed(null);
          }}
          placeholder="결제 문자를 여기에 붙여넣으세요..."
          rows={4}
          className="w-full resize-none rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 dark:border-zinc-700 dark:bg-zinc-800"
        />

        <div className="mt-2 flex flex-wrap gap-1.5">
          {PARSE_EXAMPLES.map((ex, i) => (
            <button
              key={i}
              onClick={() => {
                setText(ex);
                setParsed(parsePaymentText(ex));
              }}
              className="rounded-lg bg-zinc-100 px-2 py-1 text-xs text-zinc-500 transition hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700"
            >
              예시
            </button>
          ))}
        </div>

        <button
          onClick={handleParse}
          disabled={!text.trim()}
          className="mt-3 w-full rounded-xl border border-emerald-500 py-2.5 text-sm font-medium text-emerald-600 transition hover:bg-emerald-50 disabled:opacity-40 dark:hover:bg-emerald-950/30"
        >
          <Sparkles className="mr-1.5 inline h-4 w-4" />
          분석하기
        </button>

        {parsed && (
          <div className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50/50 p-4 dark:border-emerald-800 dark:bg-emerald-950/20">
            <div className="mb-2 flex items-center gap-2">
              <Check className="h-4 w-4 text-emerald-500" />
              <span className="text-sm font-medium">인식 결과</span>
              <span
                className={cn(
                  "ml-auto rounded-full px-2 py-0.5 text-xs font-medium",
                  parsed.confidence >= 0.8
                    ? "bg-emerald-100 text-emerald-700"
                    : "bg-amber-100 text-amber-700"
                )}
              >
                신뢰도 {Math.round(parsed.confidence * 100)}%
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>
                <p className="text-xs text-zinc-400">서비스</p>
                <p className="font-medium">{parsed.name}</p>
              </div>
              <div>
                <p className="text-xs text-zinc-400">금액</p>
                <p className="font-medium">
                  {formatMoney(parsed.amount, parsed.currency)}
                </p>
              </div>
              {parsed.category && (
                <div>
                  <p className="text-xs text-zinc-400">카테고리</p>
                  <p className="font-medium">
                    {CATEGORIES[parsed.category].emoji} {CATEGORIES[parsed.category].label}
                  </p>
                </div>
              )}
              {parsed.date && (
                <div>
                  <p className="text-xs text-zinc-400">결제일</p>
                  <p className="font-medium">{parsed.date}</p>
                </div>
              )}
            </div>
            {parsed.confidence < 0.7 && (
              <p className="mt-2 flex items-center gap-1 text-xs text-amber-600">
                <AlertCircle className="h-3 w-3" />
                결과를 확인한 후 등록해주세요
              </p>
            )}
          </div>
        )}

        {parsed && matchedSub && priceChanged && (
          <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-4 dark:border-amber-800 dark:bg-amber-950/30">
            <div className="mb-2 flex items-center gap-2">
              <RefreshCw className="h-4 w-4 text-amber-600" />
              <span className="text-sm font-semibold text-amber-800 dark:text-amber-300">
                가격 변동 감지
              </span>
            </div>
            <p className="text-xs text-amber-700 dark:text-amber-400">
              &quot;{matchedSub.name}&quot; 구독이 이미 등록되어 있습니다.
            </p>
            <div className="mt-3 flex items-center justify-center gap-3">
              <div className="text-center">
                <p className="text-xs text-zinc-500">현재</p>
                <p className="text-lg font-bold text-zinc-600 line-through dark:text-zinc-400">
                  {formatMoney(matchedSub.amount, matchedSub.currency)}
                </p>
              </div>
              <ArrowRight className="h-5 w-5 text-amber-500" />
              <div className="text-center">
                <p className="text-xs text-zinc-500">결제 문자</p>
                <p className="text-lg font-bold text-amber-700 dark:text-amber-300">
                  {formatMoney(parsed.amount, parsed.currency)}
                </p>
              </div>
            </div>
            <button
              onClick={handleUpdatePrice}
              className="mt-4 w-full rounded-xl bg-amber-500 py-3 text-sm font-semibold text-white shadow-lg shadow-amber-500/25 transition hover:bg-amber-600"
            >
              가격 업데이트하기
            </button>
          </div>
        )}

        {parsed && matchedSub && !priceChanged && (
          <div className="mt-4 rounded-xl border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-700 dark:bg-zinc-800/50">
            <p className="text-sm text-zinc-600 dark:text-zinc-300">
              &quot;{matchedSub.name}&quot;은(는) 이미 동일한 금액으로 등록되어 있습니다.
            </p>
            {parsed.date && (
              <button
                onClick={handleUpdatePrice}
                className="mt-3 w-full rounded-xl border border-zinc-200 py-2.5 text-sm font-medium dark:border-zinc-600"
              >
                결제일만 업데이트
              </button>
            )}
          </div>
        )}

        {parsed && !matchedSub && (
          <button
            onClick={handleSave}
            disabled={!isPremium || !PRO_AVAILABLE}
            className={cn(
              "mt-4 w-full rounded-xl py-3 text-sm font-semibold transition",
              isPremium && PRO_AVAILABLE
                ? "gradient-brand text-white shadow-lg shadow-emerald-500/25 hover:opacity-90"
                : "cursor-not-allowed bg-zinc-200 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400"
            )}
          >
            {isPremium && PRO_AVAILABLE ? "새 구독으로 등록" : "신규 등록 (추후 공개)"}
          </button>
        )}
      </div>
    </div>
  );
}

export function parsedToSubscription(parsed: ParsedPayment) {
  return {
    name: parsed.name,
    amount: parsed.amount,
    currency: parsed.currency,
    billingCycle: "monthly" as const,
    category: parsed.category ?? ("other" as const),
    renewalDate: parsed.date ?? defaultRenewalDate(),
    color: COLORS[Math.floor(Math.random() * COLORS.length)],
    isActive: true,
    notifyEnabled: true,
    mySharePercent: 100,
  };
}

export function parsedToSubscriptionUpdates(parsed: ParsedPayment) {
  const updates: {
    amount: number;
    currency: typeof parsed.currency;
    renewalDate?: string;
  } = {
    amount: parsed.amount,
    currency: parsed.currency,
  };
  if (parsed.date) updates.renewalDate = parsed.date;
  return updates;
}
