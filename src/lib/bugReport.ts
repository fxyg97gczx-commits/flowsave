import { APP_VERSION } from "./constants";

export type BugReportCategory = "bug" | "feature" | "other";

const CATEGORY_LABELS: Record<BugReportCategory, string> = {
  bug: "버그",
  feature: "기능 제안",
  other: "기타",
};

export interface BugReportInput {
  category: BugReportCategory;
  description: string;
  steps?: string;
}

export interface BugReportContext {
  appVersion: string;
  userAgent: string;
  platform: string;
  language: string;
  screen: string;
  displayMode: string;
  subscriptionCount: number;
  url: string;
  timestamp: string;
}

export function collectBugReportContext(subscriptionCount: number): BugReportContext {
  const displayMode =
    typeof window !== "undefined" && window.matchMedia("(display-mode: standalone)").matches
      ? "standalone (PWA)"
      : "browser";

  return {
    appVersion: APP_VERSION,
    userAgent: typeof navigator !== "undefined" ? navigator.userAgent : "unknown",
    platform: typeof navigator !== "undefined" ? navigator.platform : "unknown",
    language: typeof navigator !== "undefined" ? navigator.language : "unknown",
    screen:
      typeof window !== "undefined"
        ? `${window.screen.width}x${window.screen.height}`
        : "unknown",
    displayMode,
    subscriptionCount,
    url: typeof window !== "undefined" ? window.location.href : "",
    timestamp: new Date().toISOString(),
  };
}

export function formatBugReport(input: BugReportInput, context: BugReportContext): string {
  const lines = [
    "[FlowSave 버그 리포트]",
    "",
    `유형: ${CATEGORY_LABELS[input.category]}`,
    "",
    "── 내용 ──",
    input.description.trim(),
  ];

  if (input.steps?.trim()) {
    lines.push("", "── 재현 방법 ──", input.steps.trim());
  }

  lines.push(
    "",
    "── 환경 정보 (자동 수집) ──",
    `앱 버전: ${context.appVersion}`,
    `구독 개수: ${context.subscriptionCount}개`,
    `화면: ${context.screen}`,
    `실행 방식: ${context.displayMode}`,
    `언어: ${context.language}`,
    `플랫폼: ${context.platform}`,
    `URL: ${context.url}`,
    `시각: ${context.timestamp}`,
    `User-Agent: ${context.userAgent}`
  );

  return lines.join("\n");
}

export function buildBugReportMailto(
  email: string,
  input: BugReportInput,
  context: BugReportContext
): string {
  const subject = encodeURIComponent(
    `[FlowSave] ${CATEGORY_LABELS[input.category]} — v${context.appVersion}`
  );
  const body = encodeURIComponent(formatBugReport(input, context));
  // 매 클릭마다 URL을 달리해 브라우저가 mailto를 다시 열도록 함
  const nonce = Date.now();
  return `mailto:${email}?subject=${subject}&body=${body}&_=${nonce}`;
}

/** SPA에서 mailto가 한 번만 열리는 문제 방지 */
export function openMailtoLink(mailtoUrl: string): void {
  const link = document.createElement("a");
  link.href = mailtoUrl;
  link.style.display = "none";
  document.body.appendChild(link);
  link.click();
  link.remove();
}

export async function copyBugReportToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}
