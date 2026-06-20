"use client";

import { Bell, BellOff, Check, Trash2, X } from "lucide-react";
import { format } from "date-fns";
import { ko } from "date-fns/locale";
import { useAppStore } from "@/lib/store";
import { cn } from "@/lib/utils";
import type { AppNotification } from "@/lib/types";

const TYPE_ICONS: Record<AppNotification["type"], string> = {
  renewal: "💳",
  report: "📊",
  savings: "💡",
  system: "ℹ️",
  budget: "🎯",
  trial: "⏳",
  price: "📈",
};

interface NotificationCenterProps {
  open: boolean;
  onClose: () => void;
}

export function NotificationCenter({ open, onClose }: NotificationCenterProps) {
  const {
    notifications,
    markNotificationRead,
    markAllNotificationsRead,
    clearNotifications,
  } = useAppStore();

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={onClose} />
      <div className="animate-slide-up relative z-10 flex h-full w-full max-w-md flex-col bg-white shadow-2xl dark:bg-zinc-900 sm:rounded-l-3xl">
        <div className="flex items-center justify-between border-b border-zinc-100 px-5 py-4 dark:border-zinc-800">
          <div className="flex items-center gap-2">
            <Bell className="h-5 w-5 text-emerald-500" />
            <h2 className="font-bold">알림</h2>
            {notifications.filter((n) => !n.read).length > 0 && (
              <span className="rounded-full bg-red-500 px-2 py-0.5 text-[10px] font-bold text-white">
                {notifications.filter((n) => !n.read).length}
              </span>
            )}
          </div>
          <div className="flex items-center gap-1">
            {notifications.length > 0 && (
              <>
                <button
                  onClick={markAllNotificationsRead}
                  className="rounded-lg p-2 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-600 dark:hover:bg-zinc-800"
                  title="모두 읽음"
                >
                  <Check className="h-4 w-4" />
                </button>
                <button
                  onClick={clearNotifications}
                  className="rounded-lg p-2 text-zinc-400 hover:bg-zinc-100 hover:text-red-500 dark:hover:bg-zinc-800"
                  title="모두 삭제"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </>
            )}
            <button
              onClick={onClose}
              className="rounded-lg p-2 text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-3">
          {notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <BellOff className="mb-3 h-10 w-10 text-zinc-300" />
              <p className="text-sm text-zinc-400">알림이 없습니다</p>
              <p className="mt-1 text-xs text-zinc-300">
                결제일이 다가오면 알려드릴게요
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {notifications.map((n) => (
                <button
                  key={n.id}
                  onClick={() => markNotificationRead(n.id)}
                  className={cn(
                    "w-full rounded-xl p-4 text-left transition",
                    n.read
                      ? "bg-zinc-50 dark:bg-zinc-800/30"
                      : "bg-emerald-50 dark:bg-emerald-950/20"
                  )}
                >
                  <div className="flex items-start gap-3">
                    <span className="text-lg">{TYPE_ICONS[n.type]}</span>
                    <div className="min-w-0 flex-1">
                      <p className={cn("text-sm font-medium", !n.read && "text-emerald-800 dark:text-emerald-300")}>
                        {n.title}
                      </p>
                      <p className="mt-0.5 text-xs text-zinc-500">{n.message}</p>
                      <p className="mt-1 text-[10px] text-zinc-400">
                        {format(new Date(n.createdAt), "M/d HH:mm", { locale: ko })}
                      </p>
                    </div>
                    {!n.read && (
                      <div className="mt-1 h-2 w-2 shrink-0 rounded-full bg-emerald-500" />
                    )}
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
