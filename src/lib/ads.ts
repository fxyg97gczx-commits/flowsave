export type AdPlacement = "home-banner" | "home-native" | "list-native" | "reports-banner";

export interface PlaceholderAd {
  id: string;
  title: string;
  description: string;
  cta: string;
  emoji: string;
  accent: string;
  url?: string;
}

export const ADSENSE_CLIENT = process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID ?? "";
export const ADSENSE_SLOTS: Partial<Record<AdPlacement, string>> = {
  "home-banner": process.env.NEXT_PUBLIC_ADSENSE_SLOT_HOME_BANNER ?? "",
  "home-native": process.env.NEXT_PUBLIC_ADSENSE_SLOT_HOME_NATIVE ?? "",
  "list-native": process.env.NEXT_PUBLIC_ADSENSE_SLOT_LIST_NATIVE ?? "",
  "reports-banner": process.env.NEXT_PUBLIC_ADSENSE_SLOT_REPORTS_BANNER ?? "",
};

export function isAdSenseEnabled(): boolean {
  return Boolean(ADSENSE_CLIENT && Object.values(ADSENSE_SLOTS).some(Boolean));
}

export const PLACEHOLDER_ADS: PlaceholderAd[] = [
  {
    id: "savings-account",
    title: "고금리 적금 찾기",
    description: "연 3% 이상 적금을 한눈에 비교하세요",
    cta: "비교하기",
    emoji: "🏦",
    accent: "#3b82f6",
  },
  {
    id: "budget-app",
    title: "가계부 앱 추천",
    description: "소비 패턴 분석으로 매달 5만원 절약",
    cta: "자세히",
    emoji: "📊",
    accent: "#8b5cf6",
  },
  {
    id: "card-benefit",
    title: "구독 할인 카드",
    description: "스트리밍·음악 구독 최대 50% 캐시백",
    cta: "혜택 보기",
    emoji: "💳",
    accent: "#10b981",
  },
  {
    id: "insurance",
    title: "생활비 보험 점검",
    description: "3분 만에 내 보험료 절약 가능 여부 확인",
    cta: "무료 점검",
    emoji: "🛡️",
    accent: "#f59e0b",
  },
];

export function pickPlaceholderAd(placement: AdPlacement): PlaceholderAd {
  const hash = placement.split("").reduce((a, c) => a + c.charCodeAt(0), 0);
  const day = new Date().getDate();
  const index = (hash + day) % PLACEHOLDER_ADS.length;
  return PLACEHOLDER_ADS[index];
}
