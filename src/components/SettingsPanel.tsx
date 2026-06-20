"use client";

import {
  Bell,
  Moon,
  Sun,
  Shield,
  Smartphone,
  Megaphone,
  Target,
  Bug,
} from "lucide-react";
import { useAppStore } from "@/lib/store";
import { requestNotificationPermission } from "@/lib/notifications";
import { usePWA } from "@/hooks/usePWA";
import { APP_VERSION, BUDGET_PRESETS } from "@/lib/constants";
import { isAdSenseEnabled } from "@/lib/ads";
import { CalendarExportPanel } from "./CalendarExportPanel";
import { DataBackupPanel } from "./DataBackupPanel";
import { BugReportPanel } from "./BugReportPanel";
import { CollapsibleSection } from "./CollapsibleSection";
import { cn } from "@/lib/utils";

export function SettingsPanel() {
  const {
    settings,
    setTheme,
    updateNotificationSettings,
    updateBudgetSettings,
    dismissInstallPrompt,
  } = useAppStore();

  const { canInstall, isStandalone, install } = usePWA();

  const isDark =
    settings.theme === "dark" ||
    (settings.theme === "system" &&
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-color-scheme: dark)").matches);

  const handlePushToggle = async () => {
    if (!settings.notifications.pushEnabled) {
      const granted = await requestNotificationPermission();
      if (!granted) return;
    }
    updateNotificationSettings({ pushEnabled: !settings.notifications.pushEnabled });
  };

  const toggleDay = (day: number) => {
    const days = settings.notifications.daysBefore;
    const next = days.includes(day)
      ? days.filter((d) => d !== day)
      : [...days, day].sort((a, b) => b - a);
    updateNotificationSettings({ daysBefore: next });
  };

  const toggleTrialDay = (day: number) => {
    const days = settings.notifications.trialDaysBefore ?? [3, 1, 0];
    const next = days.includes(day)
      ? days.filter((d) => d !== day)
      : [...days, day].sort((a, b) => b - a);
    updateNotificationSettings({ trialDaysBefore: next });
  };

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-bold">설정</h2>
        <p className="text-xs text-zinc-500">v{APP_VERSION}</p>
      </div>

      <DataBackupPanel />

      <CollapsibleSection
        title="광고"
        icon={<Megaphone className="h-4 w-4 text-zinc-400" />}
      >
        <p className="text-xs leading-relaxed text-zinc-500">
          무료 이용 시 홈·구독·리포트 화면에 간단한 광고가 표시됩니다.
        </p>
        {isAdSenseEnabled() && (
          <p className="mt-2 text-xs text-zinc-400">Google AdSense 연동됨</p>
        )}
      </CollapsibleSection>

      <CollapsibleSection
        title="월 예산"
        icon={<Target className="h-4 w-4 text-emerald-500" />}
        defaultOpen={settings.budget.enabled}
      >
        <label className="flex items-center justify-between">
          <span className="text-sm">예산 한도 사용</span>
          <Toggle
            checked={settings.budget.enabled}
            onChange={() => updateBudgetSettings({ enabled: !settings.budget.enabled })}
          />
        </label>
        {settings.budget.enabled && (
          <div className="mt-4 space-y-3">
            <div>
              <p className="mb-2 text-xs text-zinc-400">월 한도 (원)</p>
              <div className="flex flex-wrap gap-2">
                {BUDGET_PRESETS.map((preset) => (
                  <button
                    key={preset}
                    onClick={() => updateBudgetSettings({ monthlyLimitKRW: preset })}
                    className={cn(
                      "rounded-lg px-3 py-1.5 text-xs font-medium transition",
                      settings.budget.monthlyLimitKRW === preset
                        ? "bg-emerald-500 text-white"
                        : "bg-zinc-100 dark:bg-zinc-800"
                    )}
                  >
                    ₩{(preset / 10000).toFixed(0)}만
                  </button>
                ))}
              </div>
              <input
                type="number"
                value={settings.budget.monthlyLimitKRW}
                onChange={(e) =>
                  updateBudgetSettings({ monthlyLimitKRW: Number(e.target.value) || 0 })
                }
                step={5000}
                min={10000}
                className="input-field mt-2"
              />
            </div>
            <label className="flex items-center justify-between">
              <span className="text-sm">초과 시 알림</span>
              <Toggle
                checked={settings.budget.alertEnabled}
                onChange={() =>
                  updateBudgetSettings({ alertEnabled: !settings.budget.alertEnabled })
                }
              />
            </label>
          </div>
        )}
      </CollapsibleSection>

      <CollapsibleSection title="테마" icon={<Sun className="h-4 w-4 text-zinc-400" />}>
        <div className="flex gap-2">
          {(["light", "dark", "system"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTheme(t)}
              className={cn(
                "flex flex-1 items-center justify-center gap-1.5 rounded-xl border py-2.5 text-xs font-medium transition",
                settings.theme === t
                  ? "border-emerald-500 bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400"
                  : "border-zinc-200 dark:border-zinc-700"
              )}
            >
              {t === "light" && <Sun className="h-3.5 w-3.5" />}
              {t === "dark" && <Moon className="h-3.5 w-3.5" />}
              {t === "system" && <Smartphone className="h-3.5 w-3.5" />}
              {t === "light" ? "라이트" : t === "dark" ? "다크" : "시스템"}
            </button>
          ))}
        </div>
      </CollapsibleSection>

      <CollapsibleSection
        title="알림"
        icon={<Bell className="h-4 w-4 text-emerald-500" />}
        defaultOpen
      >
        <div className="space-y-3">
          <label className="flex items-center justify-between">
            <span className="text-sm">앱 내 알림</span>
            <Toggle
              checked={settings.notifications.inAppEnabled}
              onChange={() =>
                updateNotificationSettings({ inAppEnabled: !settings.notifications.inAppEnabled })
              }
            />
          </label>
          <label className="flex items-center justify-between">
            <span className="text-sm">브라우저 푸시 알림</span>
            <Toggle checked={settings.notifications.pushEnabled} onChange={handlePushToggle} />
          </label>
          <label className="flex items-center justify-between">
            <span className="text-sm">이메일 리포트</span>
            <Toggle
              checked={settings.notifications.emailEnabled}
              onChange={() =>
                updateNotificationSettings({ emailEnabled: !settings.notifications.emailEnabled })
              }
            />
          </label>
          {settings.notifications.emailEnabled && (
            <input
              type="email"
              value={settings.notifications.email}
              onChange={(e) => updateNotificationSettings({ email: e.target.value })}
              placeholder="email@example.com"
              className="w-full rounded-xl border border-zinc-200 px-4 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-800"
            />
          )}
        </div>

        <p className="mb-2 mt-4 text-xs text-zinc-400">알림 시점</p>
        <div className="flex gap-2">
          {[7, 3, 0].map((day) => (
            <button
              key={day}
              onClick={() => toggleDay(day)}
              className={cn(
                "flex-1 rounded-xl border py-2 text-xs font-medium transition",
                settings.notifications.daysBefore.includes(day)
                  ? "border-emerald-500 bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30"
                  : "border-zinc-200 dark:border-zinc-700"
              )}
            >
              {day === 0 ? "당일" : `D-${day}`}
            </button>
          ))}
        </div>

        <p className="mb-2 mt-4 text-xs text-zinc-400">무료체험 종료 알림</p>
        <div className="flex gap-2">
          {[3, 1, 0].map((day) => (
            <button
              key={`trial-${day}`}
              onClick={() => toggleTrialDay(day)}
              className={cn(
                "flex-1 rounded-xl border py-2 text-xs font-medium transition",
                (settings.notifications.trialDaysBefore ?? [3, 1, 0]).includes(day)
                  ? "border-violet-500 bg-violet-50 text-violet-700 dark:bg-violet-950/30"
                  : "border-zinc-200 dark:border-zinc-700"
              )}
            >
              {day === 0 ? "당일" : `D-${day}`}
            </button>
          ))}
        </div>
      </CollapsibleSection>

      <CollapsibleSection title="캘린더보내기">
        <CalendarExportPanel embedded />
      </CollapsibleSection>

      {(canInstall || isStandalone) && (
        <CollapsibleSection title="앱 설치" icon={<Smartphone className="h-4 w-4 text-blue-500" />}>
          {isStandalone ? (
            <p className="text-sm text-emerald-600">✓ 홈 화면에 설치됨</p>
          ) : (
            <button
              onClick={async () => {
                const ok = await install();
                if (ok) dismissInstallPrompt();
              }}
              className="w-full rounded-xl bg-blue-500 py-2.5 text-sm font-semibold text-white"
            >
              홈 화면에 추가
            </button>
          )}
        </CollapsibleSection>
      )}

      <CollapsibleSection title="프라이버시" icon={<Shield className="h-4 w-4 text-emerald-500" />}>
        <p className="text-xs leading-relaxed text-zinc-500">
          모든 데이터는 이 기기의 브라우저에만 저장됩니다. 서버로 전송되지 않으며,
          삭제하려면 브라우저 데이터를 지우면 됩니다.
        </p>
      </CollapsibleSection>

      <CollapsibleSection
        title="버그 신고 · 피드백"
        icon={<Bug className="h-4 w-4 text-violet-500" />}
        defaultOpen
      >
        <BugReportPanel />
      </CollapsibleSection>
    </div>
  );
}

function Toggle({ checked, onChange }: { checked: boolean; onChange: () => void }) {
  return (
    <button
      type="button"
      onClick={onChange}
      role="switch"
      aria-checked={checked}
      className={cn(
        "relative h-6 w-11 rounded-full transition",
        checked ? "bg-emerald-500" : "bg-zinc-200 dark:bg-zinc-700"
      )}
    >
      <span
        className={cn(
          "absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition",
          checked ? "left-[22px]" : "left-0.5"
        )}
      />
    </button>
  );
}
