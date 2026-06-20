/** 서버 전용 — 버그 리포트 수신 이메일 */
export function getBugReportEmail(): string {
  return (
    process.env.BUG_REPORT_EMAIL?.trim() ||
    process.env.NEXT_PUBLIC_BUG_REPORT_EMAIL?.trim() ||
    "q8a9z0@naver.com"
  );
}

export function getBugReportGithubUrl(): string {
  return process.env.NEXT_PUBLIC_BUG_REPORT_GITHUB_URL?.trim() || "";
}
