"use client";

import {
  LayoutDashboard,
  CreditCard,
  Users,
  FileText,
  Settings,
} from "lucide-react";
import type { TabId } from "@/lib/types";
import { cn } from "@/lib/utils";
import { unreadCount } from "@/lib/notifications";
import { useAppStore } from "@/lib/store";

const TABS: { id: TabId; label: string; icon: typeof LayoutDashboard }[] = [
  { id: "home", label: "홈", icon: LayoutDashboard },
  { id: "subscriptions", label: "구독", icon: CreditCard },
  { id: "family", label: "가족", icon: Users },
  { id: "reports", label: "리포트", icon: FileText },
  { id: "settings", label: "설정", icon: Settings },
];

export function BottomNav() {
  const { activeTab, setActiveTab, notifications } = useAppStore();
  const unread = unreadCount(notifications);

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-40 border-t border-zinc-200/80 bg-white/90 backdrop-blur-xl dark:border-zinc-800/80 dark:bg-zinc-950/90"
      aria-label="메인 메뉴"
    >
      <div className="mx-auto flex max-w-lg items-center justify-around px-2 pb-[env(safe-area-inset-bottom)]">
        {TABS.map((tab) => {
          const active = activeTab === tab.id;
          const showBadge = tab.id === "home" && unread > 0;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              aria-label={tab.label}
              aria-current={active ? "page" : undefined}
              className={cn(
                "relative flex flex-1 flex-col items-center gap-0.5 py-2.5 text-xs font-medium transition",
                active
                  ? "text-emerald-600 dark:text-emerald-400"
                  : "text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300"
              )}
            >
              <tab.icon className={cn("h-5 w-5", active && "stroke-[2.5]")} />
              {tab.label}
              {showBadge && (
                <span className="absolute right-1/4 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-xs font-bold text-white">
                  {unread > 9 ? "9+" : unread}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
