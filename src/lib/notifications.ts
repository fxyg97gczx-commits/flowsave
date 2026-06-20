import { format, startOfMonth } from "date-fns";
import type {
  AppNotification,
  AppSettings,
  NotificationSettings,
  Subscription,
} from "./types";
import { daysUntilRenewal, formatMoney, generateId, totalPersonalMonthly } from "./utils";
import { getBudgetStatus, formatBudgetMessage } from "./budget";
import { daysUntilTrialEnd } from "./calendar";

function notifKey(type: string, id: string, extra?: string | number) {
  return `${type}-${id}${extra !== undefined ? `-${extra}` : ""}`;
}

export function buildRenewalNotifications(
  subs: Subscription[],
  settings: NotificationSettings,
  existing: AppNotification[]
): AppNotification[] {
  if (!settings.inAppEnabled) return [];

  const newNotifs: AppNotification[] = [];
  const existingKeys = new Set(existing.map((n) => notifKey(n.type, n.subscriptionId ?? "", n.daysLeft)));

  for (const sub of subs) {
    if (sub.isActive === false || sub.notifyEnabled === false) continue;
    const daysLeft = daysUntilRenewal(sub);

    for (const threshold of settings.daysBefore) {
      if (daysLeft !== threshold) continue;
      const key = notifKey("renewal", sub.id, threshold);
      if (existingKeys.has(key)) continue;

      newNotifs.push({
        id: generateId(),
        type: "renewal",
        title: sub.name,
        message: `${threshold === 0 ? "오늘 결제 예정" : `${threshold}일 후 결제`} — ${formatMoney(sub.amount, sub.currency)}`,
        subscriptionId: sub.id,
        createdAt: new Date().toISOString(),
        read: false,
        daysLeft: threshold,
      });
    }
  }

  return newNotifs;
}

export function buildTrialNotifications(
  subs: Subscription[],
  settings: NotificationSettings,
  existing: AppNotification[]
): AppNotification[] {
  if (!settings.inAppEnabled) return [];

  const trialDays = settings.trialDaysBefore ?? [3, 1, 0];
  const newNotifs: AppNotification[] = [];
  const existingKeys = new Set(existing.map((n) => notifKey(n.type, n.subscriptionId ?? "", n.daysLeft)));

  for (const sub of subs) {
    if (!sub.isTrial || !sub.trialEndsAt || sub.isActive === false) continue;
    const daysLeft = daysUntilTrialEnd(sub);
    if (daysLeft === null) continue;

    for (const threshold of trialDays) {
      if (daysLeft !== threshold) continue;
      const key = notifKey("trial", sub.id, threshold);
      if (existingKeys.has(key)) continue;

      const label =
        threshold === 0
          ? "오늘 무료체험 종료"
          : `${threshold}일 후 체험 종료`;

      newNotifs.push({
        id: generateId(),
        type: "trial",
        title: `${sub.name} 체험`,
        message: `${label} — 해지하지 않으면 ${formatMoney(sub.amount, sub.currency)} 자동 결제`,
        subscriptionId: sub.id,
        createdAt: new Date().toISOString(),
        read: false,
        daysLeft: threshold,
      });
    }
  }

  return newNotifs;
}

export function buildBudgetNotification(
  subs: Subscription[],
  settings: AppSettings,
  existing: AppNotification[]
): AppNotification[] {
  const { budget } = settings;
  if (!budget.enabled || !budget.alertEnabled || !settings.notifications.inAppEnabled) return [];

  const status = getBudgetStatus(subs, budget);
  if (!status || !status.isOver) return [];

  const month = format(startOfMonth(new Date()), "yyyy-MM");
  if (settings.lastBudgetAlertMonth === month) return [];

  const key = notifKey("budget", month);
  if (existing.some((n) => notifKey(n.type, month) === key || (n.type === "budget" && n.title.includes(month)))) {
    return [];
  }

  return [
    {
      id: generateId(),
      type: "budget",
      title: "월 예산 초과",
      message: formatBudgetMessage(status),
      createdAt: new Date().toISOString(),
      read: false,
    },
  ];
}

export function buildAllNotifications(
  subs: Subscription[],
  settings: AppSettings,
  existing: AppNotification[]
): AppNotification[] {
  return [
    ...buildRenewalNotifications(subs, settings.notifications, existing),
    ...buildTrialNotifications(subs, settings.notifications, existing),
    ...buildBudgetNotification(subs, settings, existing),
  ];
}

export async function requestNotificationPermission(): Promise<boolean> {
  if (typeof window === "undefined" || !("Notification" in window)) return false;
  if (Notification.permission === "granted") return true;
  if (Notification.permission === "denied") return false;
  const result = await Notification.requestPermission();
  return result === "granted";
}

export function showBrowserNotification(title: string, body: string, tag?: string) {
  if (typeof window === "undefined" || !("Notification" in window)) return;
  if (Notification.permission !== "granted") return;

  if ("serviceWorker" in navigator && navigator.serviceWorker.controller) {
    navigator.serviceWorker.controller.postMessage({
      type: "SHOW_NOTIFICATION",
      title,
      body,
      tag,
    });
    return;
  }

  new Notification(title, { body, tag, icon: "/icon.svg" });
}

export function notifyAll(notifs: AppNotification[], settings: NotificationSettings) {
  if (!settings.pushEnabled) return;

  for (const n of notifs) {
    showBrowserNotification(n.title, n.message, `${n.type}-${n.id}`);
  }
}

export function unreadCount(notifs: AppNotification[]): number {
  return notifs.filter((n) => !n.read).length;
}

export function createPriceChangeNotification(
  sub: Subscription,
  diffKRW: number
): AppNotification {
  const increased = diffKRW > 0;
  return {
    id: generateId(),
    type: "price",
    title: `${sub.name} 가격 변동`,
    message: `${increased ? "인상" : "인하"} ₩${Math.abs(diffKRW).toLocaleString()} → 현재 ${formatMoney(sub.amount, sub.currency)}`,
    subscriptionId: sub.id,
    createdAt: new Date().toISOString(),
    read: false,
  };
}
