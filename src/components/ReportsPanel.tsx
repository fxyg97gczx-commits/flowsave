"use client";

import { useState } from "react";
import { FileText, TrendingDown, TrendingUp, Mail, RefreshCw } from "lucide-react";
import { useAppStore } from "@/lib/store";
import { formatReportMonth, formatReportDate, openEmailReport } from "@/lib/reports";
import { formatMoney } from "@/lib/utils";
import { AdBanner } from "./AdBanner";
import { ShareReportButton } from "./ShareReportButton";
import { cn } from "@/lib/utils";

export function ReportsPanel() {
  const { monthlyReports, generateReport, settings } = useAppStore();
  const [message, setMessage] = useState<string | null>(null);
  const [generating, setGenerating] = useState(false);

  const handleGenerate = () => {
    setGenerating(true);
    const report = generateReport(true);
    setGenerating(false);
    if (report) {
      setMessage(`${formatReportMonth(report.month)} 리포트를 갱신했습니다.`);
      setTimeout(() => setMessage(null), 3000);
    }
  };

  const handleEmail = (reportId: string) => {
    const report = monthlyReports.find((r) => r.id === reportId);
    if (!report || !settings.notifications.email) return;
    openEmailReport(report, settings.notifications.email);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold">월별 리포트</h2>
          <p className="text-xs text-zinc-500">매월 구독 지출을 자동으로 정리합니다</p>
        </div>
        <button
          type="button"
          onClick={handleGenerate}
          disabled={generating}
          className="flex items-center gap-1.5 rounded-xl border border-zinc-200 px-3 py-2 text-xs font-medium transition hover:bg-zinc-50 disabled:opacity-50 dark:border-zinc-700 dark:hover:bg-zinc-800"
        >
          <RefreshCw className={cn("h-3.5 w-3.5", generating && "animate-spin")} />
          새로 생성
        </button>
      </div>

      {message && (
        <div className="rounded-xl bg-emerald-50 px-4 py-2.5 text-sm font-medium text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400">
          {message}
        </div>
      )}

      {monthlyReports.length === 0 ? (
        <div className="glass flex flex-col items-center rounded-2xl py-12 text-center">
          <FileText className="mb-3 h-10 w-10 text-zinc-300" />
          <p className="text-sm text-zinc-500">아직 리포트가 없습니다</p>
          <button
            type="button"
            onClick={handleGenerate}
            disabled={generating}
            className="mt-4 rounded-xl gradient-brand px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
          >
            첫 리포트 생성
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {monthlyReports.map((report, i) => (
            <div
              key={report.id}
              className="glass animate-fade-in overflow-hidden rounded-2xl"
              style={{ animationDelay: `${i * 60}ms` }}
            >
              <div className="gradient-brand px-5 py-4 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-emerald-100">월별 리포트</p>
                    <h3 className="text-xl font-bold">{formatReportMonth(report.month)}</h3>
                  </div>
                  <FileText className="h-8 w-8 text-white/30" />
                </div>
              </div>

              <div className="p-5">
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                  <div>
                    <p className="text-[10px] text-zinc-400">월 고정비</p>
                    <p className="text-lg font-bold">{formatMoney(report.totalMonthly, "KRW")}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-zinc-400">연 예상</p>
                    <p className="text-lg font-bold">{formatMoney(report.totalYearly, "KRW")}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-zinc-400">구독 수</p>
                    <p className="text-lg font-bold">{report.subscriptionCount}개</p>
                  </div>
                  {report.changeFromPrev !== undefined && (
                    <div>
                      <p className="text-[10px] text-zinc-400">전월 대비</p>
                      <p
                        className={cn(
                          "flex items-center gap-1 text-lg font-bold",
                          report.changeFromPrev > 0 ? "text-red-500" : "text-emerald-500"
                        )}
                      >
                        {report.changeFromPrev > 0 ? (
                          <TrendingUp className="h-4 w-4" />
                        ) : (
                          <TrendingDown className="h-4 w-4" />
                        )}
                        {report.changeFromPrev >= 0 ? "+" : ""}
                        {formatMoney(report.changeFromPrev, "KRW")}
                      </p>
                    </div>
                  )}
                </div>

                {report.topSubscriptions.length > 0 && (
                  <div className="mt-4 border-t border-zinc-100 pt-4 dark:border-zinc-800">
                    <p className="mb-2 text-xs font-medium text-zinc-500">TOP 3 지출</p>
                    <div className="space-y-2">
                      {report.topSubscriptions.map((s, idx) => (
                        <div key={s.name} className="flex items-center justify-between text-sm">
                          <span className="flex items-center gap-2">
                            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-zinc-100 text-[10px] font-bold dark:bg-zinc-800">
                              {idx + 1}
                            </span>
                            {s.name}
                          </span>
                          <span className="font-medium">{formatMoney(s.amount, "KRW")}/월</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="mt-4 flex flex-wrap items-center justify-between gap-2 text-[10px] text-zinc-400">
                  <span>생성: {formatReportDate(report.generatedAt)}</span>
                  <div className="flex flex-wrap items-center gap-2">
                    <ShareReportButton report={report} />
                    {settings.isPremium && settings.notifications.email && (
                      <button
                        onClick={() => handleEmail(report.id)}
                        className="flex items-center gap-1 text-emerald-600 hover:underline"
                      >
                        <Mail className="h-3 w-3" />
                        이메일
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <AdBanner placement="reports-banner" className="mt-4" />
    </div>
  );
}
