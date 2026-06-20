import type { Subscription } from "./types";
import { monthlyAmount } from "./utils";
import { CATEGORIES } from "./constants";

export function exportToCSV(subs: Subscription[]): string {
  const headers = [
    "이름", "금액", "통화", "결제주기", "카테고리", "다음결제일",
    "월환산(KRW)", "공유", "내부담%", "활성", "메모",
  ];

  const rows = subs.map((s) => [
    s.name,
    s.amount,
    s.currency,
    s.billingCycle,
    CATEGORIES[s.category].label,
    s.renewalDate,
    Math.round(monthlyAmount(s)),
    s.isShared ? "Y" : "N",
    s.mySharePercent ?? 100,
    s.isActive !== false ? "Y" : "N",
    s.notes ?? "",
  ]);

  const bom = "\uFEFF";
  const csv = [headers, ...rows]
    .map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(","))
    .join("\n");

  return bom + csv;
}

export function downloadCSV(data: string, filename: string) {
  const blob = new Blob([data], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export function exportToJSON(subs: Subscription[]): string {
  return JSON.stringify(subs, null, 2);
}

export function downloadJSON(data: string, filename: string) {
  const blob = new Blob([data], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
