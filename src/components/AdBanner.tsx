"use client";

import { ExternalLink, X } from "lucide-react";
import { useState } from "react";
import type { AdPlacement } from "@/lib/ads";
import {
  ADSENSE_SLOTS,
  isAdSenseEnabled,
  pickPlaceholderAd,
} from "@/lib/ads";
import { useShowAds } from "@/hooks/useShowAds";
import { AdSenseUnit } from "./AdSenseProvider";
import { cn } from "@/lib/utils";

interface AdBannerProps {
  placement: AdPlacement;
  className?: string;
}

export function AdBanner({ placement, className }: AdBannerProps) {
  const showAds = useShowAds();
  const [dismissed, setDismissed] = useState(false);

  if (!showAds || dismissed) return null;

  const slot = ADSENSE_SLOTS[placement];
  const useRealAds = isAdSenseEnabled() && slot;

  if (useRealAds) {
    return (
      <div className={cn("ad-container", className)}>
        <AdLabel />
        <AdSenseUnit slot={slot} format="horizontal" className="min-h-[90px]" />
      </div>
    );
  }

  const ad = pickPlaceholderAd(placement);

  return (
    <div className={cn("ad-container group relative", className)}>
      <button
        onClick={() => setDismissed(true)}
        className="absolute right-2 top-2 z-10 rounded-full p-1 text-zinc-400 opacity-0 transition hover:bg-zinc-100 hover:text-zinc-600 group-hover:opacity-100 dark:hover:bg-zinc-800"
        aria-label="광고 닫기"
      >
        <X className="h-3.5 w-3.5" />
      </button>

      <AdLabel />

      <a
        href="#"
        onClick={(e) => e.preventDefault()}
        className="flex items-center gap-3 rounded-xl border border-zinc-200/80 bg-zinc-50 p-3 transition hover:border-zinc-300 dark:border-zinc-700/80 dark:bg-zinc-800/50 dark:hover:border-zinc-600"
      >
        <div
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-xl"
          style={{ backgroundColor: `${ad.accent}18` }}
        >
          {ad.emoji}
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-zinc-800 dark:text-zinc-200">
            {ad.title}
          </p>
          <p className="truncate text-xs text-zinc-500">{ad.description}</p>
        </div>
        <span
          className="shrink-0 rounded-lg px-2.5 py-1.5 text-xs font-medium text-white"
          style={{ backgroundColor: ad.accent }}
        >
          {ad.cta}
        </span>
      </a>
    </div>
  );
}

interface NativeAdCardProps {
  placement: AdPlacement;
  className?: string;
}

export function NativeAdCard({ placement, className }: NativeAdCardProps) {
  const showAds = useShowAds();

  if (!showAds) return null;

  const slot = ADSENSE_SLOTS[placement];
  const useRealAds = isAdSenseEnabled() && slot;

  if (useRealAds) {
    return (
      <div className={cn("ad-container", className)}>
        <AdLabel />
        <AdSenseUnit slot={slot} format="rectangle" className="min-h-[120px]" />
      </div>
    );
  }

  const ad = pickPlaceholderAd(placement);

  return (
    <div
      className={cn(
        "ad-container relative overflow-hidden rounded-2xl border border-dashed border-zinc-200 dark:border-zinc-700",
        className
      )}
    >
      <div className="absolute right-0 top-0 px-2 py-1">
        <AdLabel inline />
      </div>

      <div className="flex items-start gap-3 p-4 pt-7">
        <div
          className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl text-2xl"
          style={{ backgroundColor: `${ad.accent}15` }}
        >
          {ad.emoji}
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-[10px] font-medium uppercase tracking-wide text-zinc-400">
            Sponsored
          </p>
          <p className="mt-0.5 font-semibold">{ad.title}</p>
          <p className="mt-1 text-xs leading-relaxed text-zinc-500">{ad.description}</p>
          <button
            onClick={(e) => e.preventDefault()}
            className="mt-2.5 inline-flex items-center gap-1 text-xs font-medium"
            style={{ color: ad.accent }}
          >
            {ad.cta}
            <ExternalLink className="h-3 w-3" />
          </button>
        </div>
      </div>
    </div>
  );
}

function AdLabel({ inline }: { inline?: boolean }) {
  return (
    <span
      className={cn(
        "text-[10px] font-medium uppercase tracking-wider text-zinc-400",
        inline ? "" : "mb-1.5 block"
      )}
    >
      광고
    </span>
  );
}
