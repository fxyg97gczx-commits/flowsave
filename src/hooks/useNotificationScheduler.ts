"use client";

import { useEffect } from "react";
import { useAppStore } from "@/lib/store";

export function useNotificationScheduler() {
  const checkNotifications = useAppStore((s) => s.checkNotifications);
  const generateReport = useAppStore((s) => s.generateReport);
  const hasOnboarded = useAppStore((s) => s.hasOnboarded);

  useEffect(() => {
    if (!hasOnboarded) return;

    checkNotifications();
    generateReport();

    const interval = setInterval(() => {
      checkNotifications();
    }, 60_000);

    return () => clearInterval(interval);
  }, [hasOnboarded, checkNotifications, generateReport]);
}
