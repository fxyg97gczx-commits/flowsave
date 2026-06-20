"use client";

import { useState } from "react";
import { ArrowRight, Shield, Target } from "lucide-react";
import { BUDGET_PRESETS } from "@/lib/constants";
import { useAppStore } from "@/lib/store";
import { cn } from "@/lib/utils";

interface OnboardingProps {
  onLoadSamples: () => void;
}

export function Onboarding({ onLoadSamples }: OnboardingProps) {
  const { updateBudgetSettings, completeOnboarding } = useAppStore();
  const [step, setStep] = useState(0);
  const [budget, setBudget] = useState(50000);

  const handleFinish = (withBudget: boolean) => {
    if (withBudget) {
      updateBudgetSettings({ enabled: true, monthlyLimitKRW: budget, alertEnabled: true });
    }
    completeOnboarding();
  };

  if (step === 0) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center px-4 py-12 text-center">
        <div className="mb-8 animate-fade-in">
          <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-3xl gradient-brand shadow-2xl shadow-emerald-500/30">
            <span className="text-4xl">💰</span>
          </div>
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">FlowSave</h1>
          <p className="mt-3 text-lg text-zinc-500">구독과 고정비, 이제 한눈에</p>
          <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-zinc-400">
            Netflix, Spotify, iCloud… 매달 나가는 구독비를 정리하고
            결제일을 놓치지 마세요.
          </p>
        </div>

        <div className="mb-8 grid max-w-sm gap-3 text-left">
          {[
            { emoji: "📊", text: "월·연 고정비 자동 계산" },
            { emoji: "🔔", text: "결제일 · 체험 종료 알림" },
            { emoji: "🔒", text: "데이터는 내 폰에만 저장" },
          ].map((item) => (
            <div key={item.text} className="glass flex items-center gap-3 rounded-xl px-4 py-3">
              <span className="text-xl">{item.emoji}</span>
              <span className="text-sm font-medium">{item.text}</span>
            </div>
          ))}
        </div>

        <div className="flex w-full max-w-sm flex-col gap-3">
          <button
            onClick={() => setStep(1)}
            className="flex items-center justify-center gap-2 rounded-xl gradient-brand px-8 py-3.5 text-sm font-semibold text-white shadow-lg"
          >
            시작하기
            <ArrowRight className="h-4 w-4" />
          </button>
          <button
            onClick={onLoadSamples}
            className="rounded-xl border border-zinc-200 py-3 text-sm text-zinc-600 dark:border-zinc-700 dark:text-zinc-300"
          >
            샘플로 먼저 둘러보기
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4 py-12 text-center">
      <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-100 dark:bg-emerald-950/50">
        <Target className="h-7 w-7 text-emerald-600" />
      </div>
      <h2 className="text-xl font-bold">월 예산을 정해볼까요?</h2>
      <p className="mt-2 max-w-sm text-sm text-zinc-500">
        구독비 한도를 정해 두면 초과 시 알려드려요. 나중에 설정에서 바꿀 수 있어요.
      </p>

      <div className="mt-6 flex flex-wrap justify-center gap-2">
        {BUDGET_PRESETS.map((preset) => (
          <button
            key={preset}
            onClick={() => setBudget(preset)}
            className={cn(
              "rounded-xl px-4 py-2 text-sm font-medium transition",
              budget === preset
                ? "bg-emerald-500 text-white"
                : "bg-zinc-100 dark:bg-zinc-800"
            )}
          >
            ₩{(preset / 10000).toFixed(0)}만
          </button>
        ))}
      </div>

      <div className="mt-6 flex w-full max-w-sm flex-col gap-3">
        <button
          onClick={() => handleFinish(true)}
          className="rounded-xl gradient-brand py-3.5 text-sm font-semibold text-white"
        >
          ₩{budget.toLocaleString()} 한도로 시작
        </button>
        <button
          onClick={() => handleFinish(false)}
          className="py-2 text-sm text-zinc-500 hover:text-zinc-700"
        >
          나중에 할게요
        </button>
      </div>

      <p className="mt-6 flex items-center gap-1 text-xs text-zinc-400">
        <Shield className="h-3 w-3" />
        데이터는 서버에 올라가지 않습니다
      </p>
    </div>
  );
}
