"use client";

import { useState } from "react";
import { Share2, Copy, Check } from "lucide-react";
import type { MonthlyReport } from "@/lib/types";
import { shareReportImage, copyReportImage } from "@/lib/shareReport";

interface ShareReportButtonProps {
  report: MonthlyReport;
}

export function ShareReportButton({ report }: ShareReportButtonProps) {
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [message, setMessage] = useState("");

  const handleShare = async () => {
    setLoading(true);
    try {
      const result = await shareReportImage(report);
      setMessage(result === "shared" ? "공유 완료!" : "이미지 저장됨");
    } catch {
      setMessage("공유 실패");
    }
    setLoading(false);
    setTimeout(() => setMessage(""), 2000);
  };

  const handleCopy = async () => {
    setLoading(true);
    const ok = await copyReportImage(report);
    setCopied(ok);
    setMessage(ok ? "클립보드에 복사됨" : "복사 실패");
    setLoading(false);
    setTimeout(() => {
      setCopied(false);
      setMessage("");
    }, 2000);
  };

  return (
    <div className="flex gap-2">
      <button
        onClick={handleShare}
        disabled={loading}
        className="flex items-center gap-1.5 rounded-xl border border-zinc-200 px-3 py-1.5 text-xs font-medium transition hover:bg-zinc-50 disabled:opacity-50 dark:border-zinc-700 dark:hover:bg-zinc-800"
      >
        <Share2 className="h-3.5 w-3.5" />
        {message || "이미지 공유"}
      </button>
      <button
        onClick={handleCopy}
        disabled={loading}
        className="flex items-center gap-1.5 rounded-xl border border-zinc-200 px-3 py-1.5 text-xs font-medium transition hover:bg-zinc-50 disabled:opacity-50 dark:border-zinc-700 dark:hover:bg-zinc-800"
      >
        {copied ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
        복사
      </button>
    </div>
  );
}
