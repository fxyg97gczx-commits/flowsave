import { create } from "zustand";
import { persist } from "zustand/middleware";
import { addDays, format, startOfMonth } from "date-fns";
import type {
  AppNotification,
  AppSettings,
  BudgetSettings,
  FamilyMember,
  MonthlyReport,
  NotificationSettings,
  Subscription,
  TabId,
  TutorialState,
} from "./types";
import {
  DEFAULT_BUDGET_SETTINGS,
  DEFAULT_NOTIFICATION_SETTINGS,
  FREE_TIER_LIMIT,
  SAMPLE_FAMILY,
  SAMPLE_SUBSCRIPTIONS,
} from "./constants";
import { generateId, defaultRenewalDate, toKRW } from "./utils";
import { validateImportData } from "./ux";
import {
  buildAllNotifications,
  createPriceChangeNotification,
  notifyAll,
} from "./notifications";
import {
  generateMonthlyReport,
  getPreviousMonthReport,
} from "./reports";
import { recordPriceChange } from "./priceHistory";

interface AppState {
  subscriptions: Subscription[];
  familyMembers: FamilyMember[];
  notifications: AppNotification[];
  monthlyReports: MonthlyReport[];
  settings: AppSettings;
  hasOnboarded: boolean;
  activeTab: TabId;
  tutorial: TutorialState;

  addSubscription: (sub: Omit<Subscription, "id" | "createdAt">) => boolean;
  canAddMoreSubscriptions: () => boolean;
  updateSubscription: (id: string, updates: Partial<Subscription>) => void;
  deleteSubscription: (id: string) => void;
  markUsed: (id: string) => void;
  toggleActive: (id: string) => void;

  addFamilyMember: (member: Omit<FamilyMember, "id">) => void;
  updateFamilyMember: (id: string, updates: Partial<FamilyMember>) => void;
  deleteFamilyMember: (id: string) => void;

  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;
  clearNotifications: () => void;
  checkNotifications: () => void;

  generateReport: (force?: boolean) => MonthlyReport | null;
  setActiveTab: (tab: TabId) => void;

  setTheme: (theme: AppSettings["theme"]) => void;
  updateNotificationSettings: (updates: Partial<NotificationSettings>) => void;
  updateBudgetSettings: (updates: Partial<BudgetSettings>) => void;
  dismissInstallPrompt: () => void;
  setShowFullHome: (show: boolean) => void;
  advanceTutorial: () => void;
  completeTutorial: () => void;
  skipTutorial: () => void;
  importFromJSON: (json: string, mode: "merge" | "replace") => { ok: boolean; error?: string };
  loadSamples: () => void;
  completeOnboarding: () => void;
  importSubscriptions: (subs: Subscription[]) => void;
}

const defaultSettings: AppSettings = {
  theme: "system",
  defaultCurrency: "KRW",
  isPremium: false,
  notifications: DEFAULT_NOTIFICATION_SETTINGS,
  budget: DEFAULT_BUDGET_SETTINGS,
  installPromptDismissed: false,
  showFullHome: false,
};

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      subscriptions: [],
      familyMembers: [],
      notifications: [],
      monthlyReports: [],
      settings: defaultSettings,
      hasOnboarded: false,
      activeTab: "home",
      tutorial: { completed: false, step: 0 },

      addSubscription: (sub) => {
        const { subscriptions, settings } = get();
        if (!settings.isPremium && subscriptions.length >= FREE_TIER_LIMIT) return false;

        const newSub: Subscription = {
          isActive: true,
          notifyEnabled: true,
          mySharePercent: 100,
          priceHistory: [],
          ...sub,
          id: generateId(),
          createdAt: new Date().toISOString(),
          lastUsedAt: new Date().toISOString(),
        };
        set({ subscriptions: [...subscriptions, newSub] });
        get().checkNotifications();
        return true;
      },

      canAddMoreSubscriptions: () => {
        const { subscriptions, settings } = get();
        return settings.isPremium || subscriptions.length < FREE_TIER_LIMIT;
      },

      updateSubscription: (id, updates) => {
        const sub = get().subscriptions.find((s) => s.id === id);
        if (!sub) return;

        let priceHistory = sub.priceHistory ?? [];
        let priceNotif: AppNotification | null = null;

        if (updates.amount !== undefined && updates.amount !== sub.amount) {
          priceHistory = recordPriceChange(sub, updates.amount, updates.currency);
          const prevKRW = toKRW(sub.amount, sub.currency);
          const newKRW = toKRW(updates.amount, updates.currency ?? sub.currency);
          const diff = newKRW - prevKRW;
          if (diff !== 0) {
            priceNotif = createPriceChangeNotification(
              { ...sub, ...updates, amount: updates.amount },
              diff
            );
          }
        }

        set({
          subscriptions: get().subscriptions.map((s) =>
            s.id === id ? { ...s, ...updates, priceHistory } : s
          ),
          notifications: priceNotif
            ? [priceNotif, ...get().notifications].slice(0, 50)
            : get().notifications,
        });
        get().checkNotifications();
      },

      deleteSubscription: (id) => {
        set({
          subscriptions: get().subscriptions.filter((s) => s.id !== id),
          notifications: get().notifications.filter((n) => n.subscriptionId !== id),
        });
      },

      markUsed: (id) => {
        get().updateSubscription(id, { lastUsedAt: new Date().toISOString() });
      },

      toggleActive: (id) => {
        const sub = get().subscriptions.find((s) => s.id === id);
        if (sub) get().updateSubscription(id, { isActive: sub.isActive === false });
      },

      addFamilyMember: (member) => {
        set({ familyMembers: [...get().familyMembers, { ...member, id: generateId() }] });
      },

      updateFamilyMember: (id, updates) => {
        set({
          familyMembers: get().familyMembers.map((m) =>
            m.id === id ? { ...m, ...updates } : m
          ),
        });
      },

      deleteFamilyMember: (id) => {
        set({
          familyMembers: get().familyMembers.filter((m) => m.id !== id),
          subscriptions: get().subscriptions.map((s) => ({
            ...s,
            sharedMemberIds: s.sharedMemberIds?.filter((mid) => mid !== id),
          })),
        });
      },

      markNotificationRead: (id) => {
        set({
          notifications: get().notifications.map((n) =>
            n.id === id ? { ...n, read: true } : n
          ),
        });
      },

      markAllNotificationsRead: () => {
        set({
          notifications: get().notifications.map((n) => ({ ...n, read: true })),
        });
      },

      clearNotifications: () => set({ notifications: [] }),

      checkNotifications: () => {
        const { subscriptions, settings, notifications } = get();
        const newNotifs = buildAllNotifications(subscriptions, settings, notifications);
        if (newNotifs.length === 0) return;

        const hasBudget = newNotifs.some((n) => n.type === "budget");
        const updatedSettings = hasBudget
          ? { ...settings, lastBudgetAlertMonth: format(startOfMonth(new Date()), "yyyy-MM") }
          : settings;

        set({
          settings: updatedSettings,
          notifications: [...newNotifs, ...notifications].slice(0, 50),
        });
        notifyAll(newNotifs, settings.notifications);
      },

      generateReport: (force = false) => {
        const currentMonth = format(startOfMonth(new Date()), "yyyy-MM");
        const existing = get().monthlyReports.find((r) => r.month === currentMonth);

        if (existing && !force) {
          return existing;
        }

        const baseReports = force
          ? get().monthlyReports.filter((r) => r.month !== currentMonth)
          : get().monthlyReports;

        const prev = getPreviousMonthReport(baseReports, currentMonth);
        const report = generateMonthlyReport(get().subscriptions, prev);

        const reportNotif: AppNotification = {
          id: generateId(),
          type: "report",
          title: force ? `${currentMonth.split("-")[1]}월 리포트 갱신` : `${currentMonth.split("-")[1]}월 리포트 생성`,
          message: `월 ₩${report.totalMonthly.toLocaleString()} · 구독 ${report.subscriptionCount}개`,
          createdAt: new Date().toISOString(),
          read: false,
        };

        set({
          monthlyReports: [report, ...baseReports].slice(0, 12),
          notifications: [reportNotif, ...get().notifications].slice(0, 50),
        });

        return report;
      },

      setActiveTab: (tab) => set({ activeTab: tab }),

      setTheme: (theme) => {
        set({ settings: { ...get().settings, theme } });
      },

      updateNotificationSettings: (updates) => {
        set({
          settings: {
            ...get().settings,
            notifications: { ...get().settings.notifications, ...updates },
          },
        });
      },

      updateBudgetSettings: (updates) => {
        const budget = { ...get().settings.budget, ...updates };
        set({ settings: { ...get().settings, budget, lastBudgetAlertMonth: undefined } });
        get().checkNotifications();
      },

      dismissInstallPrompt: () => {
        set({ settings: { ...get().settings, installPromptDismissed: true } });
      },

      setShowFullHome: (show) => {
        set({ settings: { ...get().settings, showFullHome: show } });
      },

      advanceTutorial: () => {
        const { tutorial } = get();
        if (tutorial.completed) return;
        const next = tutorial.step + 1;
        if (next >= 3) {
          set({ tutorial: { completed: true, step: 3 } });
        } else {
          set({ tutorial: { ...tutorial, step: next } });
        }
      },

      completeTutorial: () => {
        set({ tutorial: { completed: true, step: 3 } });
      },

      skipTutorial: () => {
        set({ tutorial: { completed: true, step: 0 } });
      },

      importFromJSON: (json, mode) => {
        try {
          const parsed = JSON.parse(json);
          const subs = validateImportData(parsed);
          if (!subs) return { ok: false, error: "올바른 FlowSave 백업 파일이 아닙니다." };

          const normalized = subs.map((s) => ({
            ...s,
            id: s.id || generateId(),
            createdAt: s.createdAt || new Date().toISOString(),
            priceHistory: s.priceHistory ?? [],
          }));

          if (mode === "replace") {
            set({ subscriptions: normalized });
          } else {
            const existing = get().subscriptions;
            const merged = [...existing];
            for (const sub of normalized) {
              const idx = merged.findIndex((e) => e.id === sub.id || e.name === sub.name);
              if (idx >= 0) merged[idx] = { ...merged[idx], ...sub };
              else merged.push(sub);
            }
            set({ subscriptions: merged });
          }
          get().checkNotifications();
          return { ok: true };
        } catch {
          return { ok: false, error: "파일을 읽을 수 없습니다." };
        }
      },

      loadSamples: () => {
        const members: FamilyMember[] = SAMPLE_FAMILY.map((m) => ({
          ...m,
          id: generateId(),
        }));
        const memberIds = members.map((m) => m.id);
        const trialEnd = format(addDays(new Date(), 5), "yyyy-MM-dd");

        const samples: Subscription[] = SAMPLE_SUBSCRIPTIONS.map((s) => ({
          ...s,
          id: generateId(),
          renewalDate: defaultRenewalDate(),
          createdAt: new Date().toISOString(),
          lastUsedAt: new Date().toISOString(),
          isActive: true,
          notifyEnabled: true,
          isShared: s.isShared ?? false,
          mySharePercent: s.mySharePercent ?? 100,
          sharedMemberIds: s.isShared ? memberIds.slice(0, 2) : undefined,
          isTrial: s.isTrial ?? false,
          trialEndsAt: s.isTrial ? trialEnd : undefined,
          priceHistory: s.name === "Netflix"
            ? [{ amount: 15000, currency: "KRW" as const, recordedAt: new Date(Date.now() - 90 * 86400000).toISOString() }]
            : [],
        }));

        set({
          subscriptions: samples,
          familyMembers: members,
          hasOnboarded: true,
          tutorial: { completed: true, step: 3 },
          settings: {
            ...get().settings,
            budget: { enabled: true, monthlyLimitKRW: 50000, alertEnabled: true },
            showFullHome: true,
          },
        });
        get().generateReport();
        get().checkNotifications();
      },

      completeOnboarding: () => set({ hasOnboarded: true }),

      importSubscriptions: (subs) => set({ subscriptions: subs }),
    }),
    {
      name: "flowsave-storage-v2",
      version: 8,
      migrate: (persisted: unknown, _version: number) => {
        const state = persisted as Record<string, unknown>;
        if (!state.settings || typeof state.settings !== "object") {
          state.settings = defaultSettings;
        } else {
          const s = state.settings as AppSettings & { stripe?: unknown; license?: unknown };
          if (!s.notifications) s.notifications = DEFAULT_NOTIFICATION_SETTINGS;
          if (!s.notifications.trialDaysBefore) s.notifications.trialDaysBefore = [3, 1, 0];
          if (!s.budget) s.budget = DEFAULT_BUDGET_SETTINGS;
          if (s.installPromptDismissed === undefined) s.installPromptDismissed = false;
          if (s.showFullHome === undefined) s.showFullHome = false;
          s.isPremium = false;
          delete s.stripe;
          delete s.license;
        }
        if (!state.tutorial) state.tutorial = { completed: false, step: 0 };
        if (!state.familyMembers) state.familyMembers = [];
        if (!state.notifications) state.notifications = [];
        if (!state.monthlyReports) state.monthlyReports = [];
        state.activeTab = "home";
        return state as unknown as AppState;
      },
      partialize: (state) => ({
        subscriptions: state.subscriptions,
        familyMembers: state.familyMembers,
        notifications: state.notifications,
        monthlyReports: state.monthlyReports,
        settings: state.settings,
        hasOnboarded: state.hasOnboarded,
        tutorial: state.tutorial,
      }),
    }
  )
);
