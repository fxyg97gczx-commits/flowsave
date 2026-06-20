"use client";

import { Moon, Sun, Wallet, Sparkles, Bell } from "lucide-react";
import { useAppStore } from "@/lib/store";
import { unreadCount } from "@/lib/notifications";

interface HeaderProps {
  onOpenNotifications?: () => void;
}

export function Header({ onOpenNotifications }: HeaderProps) {
  const { settings, setTheme, subscriptions, notifications } = useAppStore();
  const unread = unreadCount(notifications);

  const isDark =
    settings.theme === "dark" ||
    (settings.theme === "system" &&
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-color-scheme: dark)").matches);

  return (
    <header className="sticky top-0 z-40 glass border-b border-zinc-200/50 dark:border-zinc-800/50">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl gradient-brand shadow-lg shadow-emerald-500/20">
            <Wallet className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold tracking-tight">FlowSave</h1>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              {subscriptions.filter((s) => s.isActive !== false).length}개 구독 관리 중
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          {settings.isPremium && (
            <span className="hidden items-center gap-1 rounded-full bg-amber-100 px-2.5 py-1 text-xs font-medium text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 sm:flex">
              <Sparkles className="h-3 w-3" /> Pro
            </span>
          )}
          <button
            onClick={onOpenNotifications}
            className="relative flex h-9 w-9 items-center justify-center rounded-lg border border-zinc-200 bg-white text-zinc-600 transition hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300"
            aria-label="알림"
          >
            <Bell className="h-4 w-4" />
            {unread > 0 && (
              <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[9px] font-bold text-white">
                {unread > 9 ? "9+" : unread}
              </span>
            )}
          </button>
          <button
            onClick={() => setTheme(isDark ? "light" : "dark")}
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-zinc-200 bg-white text-zinc-600 transition hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300"
            aria-label="테마 전환"
          >
            {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </button>
        </div>
      </div>
    </header>
  );
}
