"use client";

import { X, Users, ChevronDown, ChevronUp, AlertCircle } from "lucide-react";
import { useEffect, useState } from "react";
import type { BillingCycle, Category, Currency, Subscription } from "@/lib/types";
import { CATEGORIES, BILLING_CYCLES, CURRENCIES, COLORS, subscriptionLimitMessage } from "@/lib/constants";
import { defaultRenewalDate } from "@/lib/utils";
import { format, addDays } from "date-fns";
import { useAppStore } from "@/lib/store";
import { cn } from "@/lib/utils";

interface AddSubscriptionModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (sub: Omit<Subscription, "id" | "createdAt">) => boolean;
  editSub?: Subscription | null;
}

function isAdvancedSub(sub: Subscription): boolean {
  return !!(
    sub.isShared ||
    sub.isTrial ||
    sub.notes ||
    sub.billingCycle !== "monthly" ||
    sub.currency !== "KRW" ||
    sub.category !== "streaming"
  );
}

export function AddSubscriptionModal({
  open, onClose, onSave, editSub,
}: AddSubscriptionModalProps) {
  const familyMembers = useAppStore((s) => s.familyMembers);
  const canAddMore = useAppStore((s) => s.canAddMoreSubscriptions());

  const [limitError, setLimitError] = useState(false);

  const [showAdvanced, setShowAdvanced] = useState(false);
  const [name, setName] = useState("");
  const [amount, setAmount] = useState("");
  const [currency, setCurrency] = useState<Currency>("KRW");
  const [billingCycle, setBillingCycle] = useState<BillingCycle>("monthly");
  const [category, setCategory] = useState<Category>("streaming");
  const [renewalDate, setRenewalDate] = useState(defaultRenewalDate());
  const [color, setColor] = useState(COLORS[0]);
  const [notes, setNotes] = useState("");
  const [isShared, setIsShared] = useState(false);
  const [mySharePercent, setMySharePercent] = useState(100);
  const [sharedMemberIds, setSharedMemberIds] = useState<string[]>([]);
  const [notifyEnabled, setNotifyEnabled] = useState(true);
  const [isTrial, setIsTrial] = useState(false);
  const [trialEndsAt, setTrialEndsAt] = useState(format(addDays(new Date(), 7), "yyyy-MM-dd"));

  useEffect(() => {
    if (editSub) {
      setName(editSub.name);
      setAmount(String(editSub.amount));
      setCurrency(editSub.currency);
      setBillingCycle(editSub.billingCycle);
      setCategory(editSub.category);
      setRenewalDate(editSub.renewalDate);
      setColor(editSub.color);
      setNotes(editSub.notes ?? "");
      setIsShared(editSub.isShared ?? false);
      setMySharePercent(editSub.mySharePercent ?? 100);
      setSharedMemberIds(editSub.sharedMemberIds ?? []);
      setNotifyEnabled(editSub.notifyEnabled !== false);
      setIsTrial(editSub.isTrial ?? false);
      setTrialEndsAt(editSub.trialEndsAt ?? format(addDays(new Date(), 7), "yyyy-MM-dd"));
      setShowAdvanced(isAdvancedSub(editSub));
    } else {
      setName(""); setAmount("");
      setCurrency("KRW"); setBillingCycle("monthly"); setCategory("streaming");
      setRenewalDate(defaultRenewalDate()); setColor(COLORS[0]);
      setNotes(""); setIsShared(false); setMySharePercent(100);
      setSharedMemberIds([]); setNotifyEnabled(true);
      setIsTrial(false);
      setTrialEndsAt(format(addDays(new Date(), 7), "yyyy-MM-dd"));
      setShowAdvanced(false);
      setLimitError(false);
    }
  }, [editSub, open]);

  if (!open) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !amount) return;

    if (!editSub && !canAddMore) {
      setLimitError(true);
      return;
    }

    const ok = onSave({
      name: name.trim(),
      amount: Number(amount),
      currency,
      billingCycle,
      category,
      renewalDate,
      color,
      notes: notes.trim() || undefined,
      isShared: showAdvanced ? isShared : false,
      mySharePercent: showAdvanced && isShared ? mySharePercent : 100,
      sharedMemberIds: showAdvanced && isShared ? sharedMemberIds : undefined,
      notifyEnabled,
      isActive: editSub?.isActive !== false,
      isTrial: showAdvanced ? isTrial : false,
      trialEndsAt: showAdvanced && isTrial ? trialEndsAt : undefined,
    });

    if (!ok) {
      setLimitError(true);
      return;
    }

    onClose();
  };

  const toggleMember = (id: string) => {
    setSharedMemberIds((prev) =>
      prev.includes(id) ? prev.filter((m) => m !== id) : [...prev, id]
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center" role="dialog" aria-modal="true" aria-labelledby="add-sub-title">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="animate-slide-up relative z-10 max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-t-3xl bg-white p-6 shadow-2xl dark:bg-zinc-900 sm:rounded-3xl">
        <div className="mb-5 flex items-center justify-between">
          <h2 id="add-sub-title" className="text-lg font-bold">
            {editSub ? "구독 수정" : "구독 추가"}
          </h2>
          <button onClick={onClose} aria-label="닫기" className="flex h-8 w-8 items-center justify-center rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800">
            <X className="h-5 w-5" />
          </button>
        </div>

        {!editSub && !showAdvanced && (
          <p className="mb-4 text-xs text-zinc-500">
            3가지만 입력하면 됩니다. 나머지는 자동으로 설정돼요.
          </p>
        )}

        {!editSub && (limitError || !canAddMore) && (
          <div
            role="alert"
            className="mb-4 flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2.5 text-sm text-amber-800 dark:border-amber-800 dark:bg-amber-950/30 dark:text-amber-300"
          >
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            <span>{subscriptionLimitMessage()}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <Field label="서비스 이름" hint="예: Netflix, Spotify">
            <input type="text" value={name} onChange={(e) => setName(e.target.value)}
              placeholder="Netflix" required autoFocus className="input-field text-base" />
          </Field>

          <Field label="월 결제 금액 (원)" hint="매달 나가는 금액">
            <input type="number" value={amount} onChange={(e) => setAmount(e.target.value)}
              placeholder="17000" min="0" required inputMode="numeric"
              className="input-field text-base" />
          </Field>

          <Field label="다음 결제일" hint="카드 결제 예정일">
            <input type="date" value={renewalDate} onChange={(e) => setRenewalDate(e.target.value)}
              required className="input-field text-base" />
          </Field>

          <button
            type="button"
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="flex w-full items-center justify-center gap-1 py-2 text-sm font-medium text-emerald-600"
          >
            {showAdvanced ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            {showAdvanced ? "간편 입력으로 접기" : "상세 설정 (카테고리, 가족공유, 체험 등)"}
          </button>

          {showAdvanced && (
            <div className="space-y-4 border-t border-zinc-100 pt-4 dark:border-zinc-800">
              <div className="grid grid-cols-2 gap-3">
                <Field label="통화">
                  <select value={currency} onChange={(e) => setCurrency(e.target.value as Currency)} className="input-field">
                    {Object.entries(CURRENCIES).map(([k, v]) => (
                      <option key={k} value={k}>{v.label}</option>
                    ))}
                  </select>
                </Field>
                <Field label="결제 주기">
                  <select value={billingCycle} onChange={(e) => setBillingCycle(e.target.value as BillingCycle)} className="input-field">
                    {Object.entries(BILLING_CYCLES).map(([k, v]) => (
                      <option key={k} value={k}>{v.label}</option>
                    ))}
                  </select>
                </Field>
              </div>

              <Field label="카테고리">
                <div className="grid grid-cols-4 gap-2">
                  {(Object.entries(CATEGORIES) as [Category, { label: string; emoji: string }][]).map(([k, v]) => (
                    <button key={k} type="button" onClick={() => setCategory(k)}
                      className={cn("rounded-xl border px-2 py-2 text-center text-xs transition",
                        category === k ? "border-emerald-500 bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50" : "border-zinc-200 dark:border-zinc-700")}>
                      <span className="text-base">{v.emoji}</span>
                      <p className="mt-0.5 truncate">{v.label}</p>
                    </button>
                  ))}
                </div>
              </Field>

              <Field label="색상">
                <div className="flex gap-2">
                  {COLORS.map((c) => (
                    <button key={c} type="button" onClick={() => setColor(c)}
                      className={cn("h-8 w-8 rounded-full", color === c && "ring-2 ring-offset-2 ring-emerald-500")}
                      style={{ backgroundColor: c }} aria-label={`색상 ${c}`} />
                  ))}
                </div>
              </Field>

              <div className="rounded-xl border border-zinc-200 p-4 dark:border-zinc-700">
                <label className="flex items-center justify-between">
                  <span className="flex items-center gap-2 text-sm font-medium">
                    <Users className="h-4 w-4 text-blue-500" /> 가족/공유
                  </span>
                  <input type="checkbox" checked={isShared} onChange={(e) => setIsShared(e.target.checked)} className="h-4 w-4 accent-emerald-500" />
                </label>
                {isShared && (
                  <div className="mt-3 space-y-3">
                    <div>
                      <label className="text-xs text-zinc-400">내 부담: {mySharePercent}%</label>
                      <input type="range" min="5" max="100" step="5" value={mySharePercent}
                        onChange={(e) => setMySharePercent(Number(e.target.value))} className="mt-1 w-full accent-emerald-500" />
                    </div>
                    {familyMembers.length > 0 && (
                      <div className="flex flex-wrap gap-1.5">
                        {familyMembers.map((m) => (
                          <button key={m.id} type="button" onClick={() => toggleMember(m.id)}
                            className={cn("rounded-lg px-2 py-1 text-xs",
                              sharedMemberIds.includes(m.id) ? "bg-blue-100 text-blue-700" : "bg-zinc-100 dark:bg-zinc-800")}>
                            {m.emoji} {m.name}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="rounded-xl border border-violet-200 p-4 dark:border-violet-900">
                <label className="flex items-center justify-between">
                  <span className="text-sm font-medium text-violet-700 dark:text-violet-400">무료 체험 중</span>
                  <input type="checkbox" checked={isTrial} onChange={(e) => setIsTrial(e.target.checked)} className="h-4 w-4 accent-violet-500" />
                </label>
                {isTrial && (
                  <input type="date" value={trialEndsAt} onChange={(e) => setTrialEndsAt(e.target.value)}
                    className="input-field mt-3" required />
                )}
              </div>

              <label className="flex items-center justify-between text-sm">
                <span>결제 알림</span>
                <input type="checkbox" checked={notifyEnabled} onChange={(e) => setNotifyEnabled(e.target.checked)} className="h-4 w-4 accent-emerald-500" />
              </label>

              <Field label="메모">
                <input type="text" value={notes} onChange={(e) => setNotes(e.target.value)} className="input-field" />
              </Field>
            </div>
          )}

          <button
            type="submit"
            disabled={!editSub && !canAddMore}
            className={cn(
              "w-full rounded-xl py-3.5 text-base font-semibold text-white shadow-lg",
              !editSub && !canAddMore
                ? "cursor-not-allowed bg-zinc-300 shadow-none dark:bg-zinc-700"
                : "gradient-brand shadow-emerald-500/25"
            )}
          >
            {editSub ? "저장하기" : "추가하기"}
          </button>
        </form>
      </div>
    </div>
  );
}

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">{label}</label>
      {hint && <p className="mb-1.5 text-xs text-zinc-400">{hint}</p>}
      {children}
    </div>
  );
}
