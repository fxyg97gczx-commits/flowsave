"use client";

import { useAppStore } from "@/lib/store";

export function useShowAds(): boolean {
  const isPremium = useAppStore((s) => s.settings.isPremium);
  return !isPremium;
}
