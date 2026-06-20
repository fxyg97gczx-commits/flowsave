import type { BillingCycle, Category, Currency } from "./types";

export const FREE_TIER_LIMIT = 5;
/** Pro 기능 공개 여부 — 추후 true로 전환 */
export const PRO_AVAILABLE = false;
export const TUTORIAL_TOTAL_STEPS = 4;
export const APP_VERSION = "2.5.5";

/** 클라이언트 폴백 (실제 값은 /api/bug-report/config 에서 로드) */
export const BUG_REPORT_EMAIL =
  process.env.NEXT_PUBLIC_BUG_REPORT_EMAIL?.trim() || "q8a9z0@naver.com";
/** GitHub Issues URL (선택) */
export const BUG_REPORT_GITHUB_URL = process.env.NEXT_PUBLIC_BUG_REPORT_GITHUB_URL ?? "";

export function subscriptionLimitMessage(): string {
  return `무료로는 구독 ${FREE_TIER_LIMIT}개까지 등록할 수 있습니다.`;
}

export const DEFAULT_NOTIFICATION_SETTINGS = {
  pushEnabled: false,
  inAppEnabled: true,
  emailEnabled: false,
  email: "",
  daysBefore: [7, 3, 0],
  trialDaysBefore: [3, 1, 0],
};

export const DEFAULT_BUDGET_SETTINGS = {
  enabled: false,
  monthlyLimitKRW: 50000,
  alertEnabled: true,
};

export const BUDGET_PRESETS = [30000, 50000, 80000, 100000, 150000];

export const CATEGORIES: Record<Category, { label: string; emoji: string }> = {
  streaming: { label: "스트리밍", emoji: "🎬" },
  music: { label: "음악", emoji: "🎵" },
  productivity: { label: "생산성", emoji: "💼" },
  cloud: { label: "클라우드", emoji: "☁️" },
  fitness: { label: "피트니스", emoji: "💪" },
  news: { label: "뉴스·매거진", emoji: "📰" },
  gaming: { label: "게임", emoji: "🎮" },
  other: { label: "기타", emoji: "📦" },
};

export const BILLING_CYCLES: Record<BillingCycle, { label: string; months: number }> = {
  weekly: { label: "매주", months: 0.25 },
  monthly: { label: "매월", months: 1 },
  yearly: { label: "매년", months: 12 },
};

export const CURRENCIES: Record<Currency, { label: string; symbol: string }> = {
  KRW: { label: "원 (KRW)", symbol: "₩" },
  USD: { label: "달러 (USD)", symbol: "$" },
  EUR: { label: "유로 (EUR)", symbol: "€" },
  JPY: { label: "엔 (JPY)", symbol: "¥" },
};

export const COLORS = [
  "#10b981", "#3b82f6", "#8b5cf6", "#f59e0b",
  "#ef4444", "#ec4899", "#06b6d4", "#84cc16",
];

export const MEMBER_EMOJIS = ["👤", "👩", "👨", "👧", "👦", "🧑", "👵", "👴", "🐶", "🐱"];

export const KNOWN_SERVICES: { pattern: RegExp; name: string; category: Category }[] = [
  { pattern: /netflix|넷플릭스/i, name: "Netflix", category: "streaming" },
  { pattern: /spotify|스포티파이/i, name: "Spotify", category: "music" },
  { pattern: /youtube|유튜브/i, name: "YouTube Premium", category: "streaming" },
  { pattern: /icloud|아이클라우드/i, name: "iCloud+", category: "cloud" },
  { pattern: /apple\s*one|애플원/i, name: "Apple One", category: "cloud" },
  { pattern: /disney|디즈니/i, name: "Disney+", category: "streaming" },
  { pattern: /wavve|웨이브/i, name: "Wavve", category: "streaming" },
  { pattern: /tving|티빙/i, name: "TVING", category: "streaming" },
  { pattern: /coupang\s*play|쿠팡플레이/i, name: "쿠팡플레이", category: "streaming" },
  { pattern: /melon|멜론/i, name: "멜론", category: "music" },
  { pattern: /genie|지니/i, name: "지니뮤직", category: "music" },
  { pattern: /notion|노션/i, name: "Notion", category: "productivity" },
  { pattern: /chatgpt|openai/i, name: "ChatGPT Plus", category: "productivity" },
  { pattern: /claude|anthropic/i, name: "Claude Pro", category: "productivity" },
  { pattern: /microsoft|ms\s*365|오피스/i, name: "Microsoft 365", category: "productivity" },
  { pattern: /google\s*one|구글원/i, name: "Google One", category: "cloud" },
  { pattern: /dropbox|드롭박스/i, name: "Dropbox", category: "cloud" },
  { pattern: /adobe|어도비/i, name: "Adobe CC", category: "productivity" },
  { pattern: /gym|헬스|피트니스|필라테스/i, name: "피트니스", category: "fitness" },
  { pattern: /steam|스팀/i, name: "Steam", category: "gaming" },
  { pattern: /playstation|psn/i, name: "PlayStation Plus", category: "gaming" },
  { pattern: /xbox/i, name: "Xbox Game Pass", category: "gaming" },
];

export const SAMPLE_SUBSCRIPTIONS = [
  { name: "Netflix", amount: 17000, currency: "KRW" as Currency, billingCycle: "monthly" as BillingCycle, category: "streaming" as Category, color: "#ef4444", isShared: true, mySharePercent: 50 },
  { name: "Spotify", amount: 10900, currency: "KRW" as Currency, billingCycle: "monthly" as BillingCycle, category: "music" as Category, color: "#10b981" },
  { name: "iCloud+", amount: 1100, currency: "KRW" as Currency, billingCycle: "monthly" as BillingCycle, category: "cloud" as Category, color: "#3b82f6", isShared: true, mySharePercent: 25 },
  { name: "ChatGPT Plus", amount: 22, currency: "USD" as Currency, billingCycle: "monthly" as BillingCycle, category: "productivity" as Category, color: "#8b5cf6", isTrial: true, trialEndsAt: "" },
];

export const SAMPLE_FAMILY = [
  { name: "나", emoji: "👤", color: "#10b981" },
  { name: "파트너", emoji: "👩", color: "#ec4899" },
  { name: "동생", emoji: "👦", color: "#3b82f6" },
];

export const PARSE_EXAMPLES = [
  "[신한카드] 06/15 17,000원 Netflix 자동결제",
  "06/15 Netflix 17,500원 승인",
  "Spotify 10,900원 정기결제 완료",
  "YouTube Premium 월 14,900원 결제",
];
