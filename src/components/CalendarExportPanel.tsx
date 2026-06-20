"use client";

import { useState } from "react";
import { Calendar, Download, ExternalLink } from "lucide-react";
import { useAppStore } from "@/lib/store";
import { downloadICS, googleCalendarUrl } from "@/lib/calendar";

interface CalendarExportPanelProps {
  embedded?: boolean;
}

export function CalendarExportPanel({ embedded = false }: CalendarExportPanelProps) {
  const subscriptions = useAppStore((s) => s.subscriptions);
  const active = subscriptions.filter((s) => s.isActive !== false);
  const [exported, setExported] = useState(false);

  const handleICS = () => {
    downloadICS(active);
    setExported(true);
    setTimeout(() => setExported(false), 2000);
  };

  if (active.length === 0) {
    if (embedded) {
      return (
        <p className="text-xs text-zinc-500">구독을 추가하면 결제일을 캘린더에보낼 수 있습니다.</p>
      );
    }
    return (
      <section className="glass rounded-2xl p-5">
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-blue-500" />
          <h3 className="font-semibold">캘린더 연동</h3>
        </div>
        <p className="mt-2 text-xs text-zinc-500">구독을 추가하면 결제일을 캘린더에보낼 수 있습니다.</p>
      </section>
    );
  }

  const content = (
    <>
      {!embedded && (
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-blue-500" />
          <h3 className="font-semibold">캘린더 연동</h3>
        </div>
      )}
      <p className={embedded ? "text-xs leading-relaxed text-zinc-500" : "mt-2 text-xs leading-relaxed text-zinc-500"}>
        모든 결제일과 무료체험 종료일을 캘린더에 추가하세요. Apple 캘린더, Google 캘린더, Outlook 모두 지원합니다.
      </p>

      <div className="mt-4 flex flex-col gap-2 sm:flex-row">
        <button
          onClick={handleICS}
          className="flex flex-1 items-center justify-center gap-2 rounded-xl gradient-brand py-2.5 text-sm font-semibold text-white"
        >
          <Download className="h-4 w-4" />
          {exported ? "다운로드 완료!" : `.ics 파일 (${active.length}건)`}
        </button>
      </div>

      <p className="mt-3 text-xs text-zinc-400">
        Google 캘린더: .ics 파일을 calendar.google.com → 설정 → 가져오기에서 업로드
      </p>

      {active.length <= 5 && (
        <div className="mt-3 space-y-1.5 border-t border-zinc-100 pt-3 dark:border-zinc-800">
          <p className="text-xs font-medium text-zinc-400">개별 Google 캘린더 추가</p>
          {active.map((sub) => (
            <a
              key={sub.id}
              href={googleCalendarUrl(sub)}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-xs text-blue-600 hover:underline dark:text-blue-400"
            >
              <ExternalLink className="h-3 w-3" />
              {sub.name}
            </a>
          ))}
        </div>
      )}
    </>
  );

  if (embedded) return <div>{content}</div>;

  return <section className="glass rounded-2xl p-5">{content}</section>;
}
