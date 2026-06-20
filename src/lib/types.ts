export type BillingCycle = "monthly" | "yearly" | "weekly";
export type Currency = "KRW" | "USD" | "EUR" | "JPY";
export type Category =
  | "streaming"
  | "music"
  | "productivity"
  | "cloud"
  | "fitness"
  | "news"
  | "gaming"
  | "other";

export type TabId = "home" | "subscriptions" | "family" | "reports" | "settings";

export type NotificationType =
  | "renewal"
  | "report"
  | "savings"
  | "system"
  | "budget"
  | "trial"
  | "price";

export interface PriceHistoryEntry {
  amount: number;
  currency: Currency;
  recordedAt: string;
}

export interface Subscription {
  id: string;
  name: string;
  amount: number;
  currency: Currency;
  billingCycle: BillingCycle;
  category: Category;
  renewalDate: string;
  color: string;
  notes?: string;
  createdAt: string;
  isShared?: boolean;
  sharedMemberIds?: string[];
  mySharePercent?: number;
  lastUsedAt?: string;
  isActive?: boolean;
  notifyEnabled?: boolean;
  isTrial?: boolean;
  trialEndsAt?: string;
  priceHistory?: PriceHistoryEntry[];
}

export interface FamilyMember {
  id: string;
  name: string;
  emoji: string;
  color: string;
}

export interface NotificationSettings {
  pushEnabled: boolean;
  inAppEnabled: boolean;
  emailEnabled: boolean;
  email: string;
  daysBefore: number[];
  trialDaysBefore: number[];
}

export interface BudgetSettings {
  enabled: boolean;
  monthlyLimitKRW: number;
  alertEnabled: boolean;
}

export interface AppNotification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  subscriptionId?: string;
  createdAt: string;
  read: boolean;
  daysLeft?: number;
}

export interface MonthlyReport {
  id: string;
  month: string;
  totalMonthly: number;
  totalYearly: number;
  subscriptionCount: number;
  topSubscriptions: { name: string; amount: number }[];
  categoryBreakdown: { category: string; amount: number }[];
  changeFromPrev?: number;
  generatedAt: string;
}

export interface ParsedPayment {
  name: string;
  amount: number;
  currency: Currency;
  date?: string;
  category?: Category;
  confidence: number;
  raw: string;
}

export interface AppSettings {
  theme: "light" | "dark" | "system";
  defaultCurrency: Currency;
  isPremium: boolean;
  notifications: NotificationSettings;
  budget: BudgetSettings;
  installPromptDismissed: boolean;
  lastBudgetAlertMonth?: string;
  showFullHome: boolean;
}

export interface TutorialState {
  completed: boolean;
  step: number;
}
