"use client";

import { useAppStore } from "@/lib/store";
import { exportToJSON, downloadJSON } from "@/lib/export";
import { Upload, Download, AlertTriangle } from "lucide-react";
import { useRef, useState } from "react";

export function DataBackupPanel() {
  const { subscriptions, importFromJSON } = useAppStore();
  const fileRef = useRef<HTMLInputElement>(null);
  const [message, setMessage] = useState<{ type: "ok" | "err"; text: string } | null>(null);

  const handleExport = () => {
    downloadJSON(
      exportToJSON(subscriptions),
      `flowsave-backup-${new Date().toISOString().slice(0, 10)}.json`
    );
    setMessage({ type: "ok", text: "백업 파일이 저장되었습니다." });
    setTimeout(() => setMessage(null), 3000);
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const result = importFromJSON(String(reader.result), "merge");
      setMessage(
        result.ok
          ? { type: "ok", text: "데이터를 불러왔습니다." }
          : { type: "err", text: result.error ?? "가져오기 실패" }
      );
      setTimeout(() => setMessage(null), 3000);
    };
    reader.readAsText(file);
    e.target.value = "";
  };

  return (
    <section className="glass rounded-2xl p-5">
      <div className="mb-3 flex items-start gap-2 rounded-xl bg-amber-50 p-3 dark:bg-amber-950/20">
        <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
        <p className="text-xs leading-relaxed text-amber-800 dark:text-amber-300">
          데이터는 이 기기 브라우저에만 저장됩니다. 폰을 바꾸거나 데이터를 지우기 전에{" "}
          <strong>반드시 백업</strong>해 두세요.
        </p>
      </div>

      <h3 className="mb-1 font-semibold">데이터 백업 · 복원</h3>
      <p className="mb-4 text-xs text-zinc-500">무료로 JSON 파일보내기/가져오기가 가능합니다.</p>

      <div className="flex flex-col gap-2 sm:flex-row">
        <button
          onClick={handleExport}
          disabled={subscriptions.length === 0}
          className="flex flex-1 items-center justify-center gap-2 rounded-xl gradient-brand py-2.5 text-sm font-semibold text-white disabled:opacity-40"
        >
          <Download className="h-4 w-4" />
          백업 파일 저장
        </button>
        <button
          onClick={() => fileRef.current?.click()}
          className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-zinc-200 py-2.5 text-sm font-medium dark:border-zinc-700"
        >
          <Upload className="h-4 w-4" />
          백업에서 복원
        </button>
        <input
          ref={fileRef}
          type="file"
          accept=".json,application/json"
          onChange={handleImport}
          className="hidden"
        />
      </div>

      {message && (
        <p
          className={`mt-3 text-xs font-medium ${message.type === "ok" ? "text-emerald-600" : "text-red-500"}`}
        >
          {message.text}
        </p>
      )}
    </section>
  );
}
