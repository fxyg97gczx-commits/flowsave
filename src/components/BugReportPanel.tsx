"use client";

import { useState } from "react";
import { Copy, Mail, ExternalLink, Check } from "lucide-react";
import { useAppStore } from "@/lib/store";
import {
  type BugReportCategory,
  buildBugReportMailto,
  collectBugReportContext,
  copyBugReportToClipboard,
  formatBugReport,
  openMailtoLink,
} from "@/lib/bugReport";
import { BUG_REPORT_EMAIL, BUG_REPORT_GITHUB_URL } from "@/lib/constants";
import { cn } from "@/lib/utils";

const CATEGORIES: { id: BugReportCategory; label: string }[] = [
  { id: "bug", label: "버그" },
  { id: "feature", label: "기능 제안" },
  { id: "other", label: "기타" },
];

export function BugReportPanel() {
  const subscriptionCount = useAppStore((s) => s.subscriptions.length);
  const [category, setCategory] = useState<BugReportCategory>("bug");
  const [description, setDescription] = useState("");
  const [steps, setSteps] = useState("");
  const [message, setMessage] = useState<{ type: "ok" | "err"; text: string } | null>(null);

  const showMessage = (type: "ok" | "err", text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 3500);
  };

  const buildReport = () => {
    const context = collectBugReportContext(subscriptionCount);
    return formatBugReport({ category, description, steps }, context);
  };

  const validate = () => {
    if (!description.trim()) {
      showMessage("err", "내용을 입력해 주세요.");
      return false;
    }
    return true;
  };

  const handleCopy = async () => {
    if (!validate()) return;
    const ok = await copyBugReportToClipboard(buildReport());
    showMessage(
      ok ? "ok" : "err",
      ok ? "리포트가 클립보드에 복사되었습니다." : "복사에 실패했습니다. 직접 선택해 복사해 주세요."
    );
  };

  const handleEmail = () => {
    if (!validate()) return;
    if (!BUG_REPORT_EMAIL) {
      showMessage("err", "이메일 주소가 설정되지 않았습니다. 복사 기능을 이용해 주세요.");
      return;
    }
    const context = collectBugReportContext(subscriptionCount);
    const mailto = buildBugReportMailto(
      BUG_REPORT_EMAIL,
      { category, description, steps },
      context
    );
    openMailtoLink(mailto);
    showMessage("ok", "메일 앱을 열었습니다. 안 열리면 클립보드 복사를 이용해 주세요.");
  };

  return (
    <div className="space-y-3">
      <p className="text-xs leading-relaxed text-zinc-500">
        문제가 있거나 아이디어가 있으면 알려주세요. 구독 이름·금액 등 개인 데이터는 포함되지
        않습니다.
      </p>

      <div className="flex gap-2">
        {CATEGORIES.map((c) => (
          <button
            key={c.id}
            type="button"
            onClick={() => setCategory(c.id)}
            className={cn(
              "flex-1 rounded-xl border py-2 text-xs font-medium transition",
              category === c.id
                ? "border-emerald-500 bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400"
                : "border-zinc-200 dark:border-zinc-700"
            )}
          >
            {c.label}
          </button>
        ))}
      </div>

      <div>
        <label className="mb-1 block text-xs font-medium text-zinc-600 dark:text-zinc-400">
          무엇이 문제인가요?
        </label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="예: 구독 추가 후 홈 화면에 바로 안 보여요"
          rows={3}
          className="w-full resize-none rounded-xl border border-zinc-200 px-3 py-2.5 text-sm dark:border-zinc-700 dark:bg-zinc-800"
        />
      </div>

      <div>
        <label className="mb-1 block text-xs font-medium text-zinc-600 dark:text-zinc-400">
          재현 방법 (선택)
        </label>
        <textarea
          value={steps}
          onChange={(e) => setSteps(e.target.value)}
          placeholder="1. 구독 탭 열기 → 2. + 버튼 → 3. …"
          rows={2}
          className="w-full resize-none rounded-xl border border-zinc-200 px-3 py-2.5 text-sm dark:border-zinc-700 dark:bg-zinc-800"
        />
      </div>

      <div className="flex flex-col gap-2 sm:flex-row">
        <button
          type="button"
          onClick={handleCopy}
          className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-zinc-200 py-2.5 text-sm font-medium dark:border-zinc-700"
        >
          <Copy className="h-4 w-4" />
          클립보드에 복사
        </button>
        {BUG_REPORT_EMAIL && (
          <button
            type="button"
            onClick={handleEmail}
            className="flex flex-1 items-center justify-center gap-2 rounded-xl gradient-brand py-2.5 text-sm font-semibold text-white"
          >
            <Mail className="h-4 w-4" />
            이메일로 보내기
          </button>
        )}
      </div>

      {BUG_REPORT_GITHUB_URL && (
        <a
          href={BUG_REPORT_GITHUB_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-600 hover:underline dark:text-emerald-400"
        >
          <ExternalLink className="h-3.5 w-3.5" />
          GitHub에서 이슈 등록하기
        </a>
      )}

      {message && (
        <p
          className={cn(
            "flex items-center gap-1.5 text-xs",
            message.type === "ok" ? "text-emerald-600" : "text-red-500"
          )}
        >
          {message.type === "ok" && <Check className="h-3.5 w-3.5" />}
          {message.text}
        </p>
      )}
    </div>
  );
}
