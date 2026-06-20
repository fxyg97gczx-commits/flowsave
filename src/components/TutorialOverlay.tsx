"use client";

import { Plus, LayoutDashboard, Settings, X } from "lucide-react";
import { useAppStore } from "@/lib/store";

const STEPS = [
  {
    target: "fab",
    title: "구독 추가하기",
    desc: "오른쪽 아래 + 버튼을 눌러 Netflix, Spotify 등을 등록하세요. 이름·금액·날짜만 입력하면 됩니다.",
    icon: Plus,
    tab: "subscriptions" as const,
  },
  {
    target: "home",
    title: "월 고정비 확인",
    desc: "홈 화면에서 이번 달 총 지출을 한눈에 볼 수 있어요.",
    icon: LayoutDashboard,
    tab: "home" as const,
  },
  {
    target: "settings",
    title: "백업과 알림 설정",
    desc: "설정에서 데이터를 백업하고, 결제 알림을 켜 두세요.",
    icon: Settings,
    tab: "settings" as const,
  },
];

export function TutorialOverlay() {
  const { tutorial, advanceTutorial, skipTutorial, setActiveTab } = useAppStore();

  if (tutorial.completed) return null;

  const step = STEPS[tutorial.step] ?? STEPS[0];
  const StepIcon = step.icon;

  const handleNext = () => {
    setActiveTab(step.tab);
    advanceTutorial();
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-end justify-center p-4 sm:items-center">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={skipTutorial} />
      <div className="relative z-10 w-full max-w-md animate-slide-up rounded-2xl bg-white p-6 shadow-2xl dark:bg-zinc-900">
        <div className="mb-4 flex items-center justify-between">
          <span className="text-xs font-medium text-emerald-600">
            시작 가이드 {tutorial.step + 1} / {STEPS.length}
          </span>
          <button
            onClick={skipTutorial}
            className="rounded-lg p-1 text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800"
            aria-label="가이드 건너뛰기"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-100 dark:bg-emerald-950/50">
          <StepIcon className="h-6 w-6 text-emerald-600" />
        </div>

        <h2 className="text-lg font-bold">{step.title}</h2>
        <p className="mt-2 text-sm leading-relaxed text-zinc-500">{step.desc}</p>

        <div className="mt-4 flex gap-1.5">
          {STEPS.map((_, i) => (
            <div
              key={i}
              className={`h-1.5 flex-1 rounded-full ${i <= tutorial.step ? "bg-emerald-500" : "bg-zinc-200 dark:bg-zinc-700"}`}
            />
          ))}
        </div>

        <div className="mt-5 flex gap-2">
          <button
            onClick={skipTutorial}
            className="flex-1 rounded-xl border border-zinc-200 py-2.5 text-sm font-medium dark:border-zinc-700"
          >
            건너뛰기
          </button>
          <button
            onClick={handleNext}
            className="flex-1 rounded-xl gradient-brand py-2.5 text-sm font-semibold text-white"
          >
            {tutorial.step >= STEPS.length - 1 ? "시작하기" : "다음"}
          </button>
        </div>
      </div>
    </div>
  );
}
