"use client";

import { Download, X } from "lucide-react";
import { usePWA } from "@/hooks/usePWA";
import { useAppStore } from "@/lib/store";

export function PWAInstallPrompt() {
  const { canInstall, install } = usePWA();
  const { settings, dismissInstallPrompt } = useAppStore();

  if (!canInstall || settings.installPromptDismissed) return null;

  return (
    <div className="fixed bottom-20 left-4 right-4 z-30 mx-auto max-w-lg animate-slide-up sm:bottom-6 sm:left-auto sm:right-6 sm:max-w-sm">
      <div className="flex items-start gap-3 rounded-2xl border border-blue-200 bg-white p-4 shadow-xl dark:border-blue-800 dark:bg-zinc-900">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-100 dark:bg-blue-950/50">
          <Download className="h-5 w-5 text-blue-600" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold">앱으로 설치하기</p>
          <p className="mt-0.5 text-xs text-zinc-500">
            홈 화면에 추가하면 더 빠르게 접근할 수 있어요
          </p>
          <div className="mt-2 flex gap-2">
            <button
              onClick={async () => {
                const ok = await install();
                if (ok) dismissInstallPrompt();
              }}
              className="rounded-lg bg-blue-500 px-3 py-1.5 text-xs font-semibold text-white"
            >
              설치
            </button>
            <button
              onClick={dismissInstallPrompt}
              className="rounded-lg px-3 py-1.5 text-xs text-zinc-500"
            >
              나중에
            </button>
          </div>
        </div>
        <button onClick={dismissInstallPrompt} className="text-zinc-400">
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
