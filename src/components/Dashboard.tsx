"use client";

import { useState, useEffect } from "react";
import { Plus, ClipboardPaste } from "lucide-react";
import { Header } from "./Header";
import { BottomNav } from "./BottomNav";
import { HomeView } from "./HomeView";
import { SubscriptionsView } from "./SubscriptionsView";
import { FamilyPanel } from "./FamilyPanel";
import { ReportsPanel } from "./ReportsPanel";
import { SettingsPanel } from "./SettingsPanel";
import { AddSubscriptionModal } from "./AddSubscriptionModal";
import { ParsePaymentModal, parsedToSubscription, parsedToSubscriptionUpdates } from "./ParsePaymentModal";
import { NotificationCenter } from "./NotificationCenter";
import { PWAInstallPrompt } from "./PWAInstallPrompt";
import { PriceHistoryModal } from "./PriceHistoryModal";
import { Onboarding } from "./Onboarding";
import { TutorialOverlay } from "./TutorialOverlay";
import { useAppStore } from "@/lib/store";
import { useHydration } from "@/hooks/useHydration";
import { useNotificationScheduler } from "@/hooks/useNotificationScheduler";
import type { Subscription } from "@/lib/types";
import { APP_VERSION, subscriptionLimitMessage } from "@/lib/constants";

type LimitReason = "count" | "pro" | null;

export function Dashboard() {
  const hydrated = useHydration();
  const {
    settings,
    hasOnboarded,
    activeTab,
    setActiveTab,
    addSubscription,
    canAddMoreSubscriptions,
    updateSubscription,
    loadSamples,
  } = useAppStore();

  useNotificationScheduler();

  useEffect(() => {
    if (!hydrated) return;
    const params = new URLSearchParams(window.location.search);
    const tab = params.get("tab");
    const valid = ["home", "subscriptions", "family", "reports", "settings"] as const;
    if (tab && valid.includes(tab as (typeof valid)[number])) {
      setActiveTab(tab as (typeof valid)[number]);
      window.history.replaceState({}, "", window.location.pathname);
    }
  }, [hydrated, setActiveTab]);

  const [modalOpen, setModalOpen] = useState(false);
  const [parseOpen, setParseOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [priceHistorySub, setPriceHistorySub] = useState<Subscription | null>(null);
  const [editSub, setEditSub] = useState<Subscription | null>(null);
  const [limitReason, setLimitReason] = useState<LimitReason>(null);

  const handleSave = (data: Omit<Subscription, "id" | "createdAt">): boolean => {
    if (editSub) {
      updateSubscription(editSub.id, data);
      setEditSub(null);
      return true;
    }
    const ok = addSubscription(data);
    if (!ok) setLimitReason("count");
    return ok;
  };

  const handleParseSave = (parsed: Parameters<typeof parsedToSubscription>[0]) => {
    if (!settings.isPremium) {
      setLimitReason("pro");
      return;
    }
    const ok = addSubscription(parsedToSubscription(parsed));
    if (!ok) setLimitReason("count");
    else setParseOpen(false);
  };

  const handleParseUpdatePrice = (
    subscriptionId: string,
    parsed: Parameters<typeof parsedToSubscriptionUpdates>[0]
  ) => {
    updateSubscription(subscriptionId, parsedToSubscriptionUpdates(parsed));
    setParseOpen(false);
  };

  const openAdd = () => {
    if (!canAddMoreSubscriptions()) {
      setLimitReason("count");
      return;
    }
    setEditSub(null);
    setModalOpen(true);
  };

  const openEdit = (sub: Subscription) => {
    setEditSub(sub);
    setModalOpen(true);
  };

  if (!hydrated) {
    return (
      <div className="flex min-h-screen items-center justify-center gradient-mesh">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-emerald-500 border-t-transparent" />
      </div>
    );
  }

  if (!hasOnboarded) {
    return (
      <div className="min-h-screen gradient-mesh">
        <Onboarding onLoadSamples={loadSamples} />
      </div>
    );
  }

  const limitMessage =
    limitReason === "count"
      ? subscriptionLimitMessage()
      : limitReason === "pro"
        ? "문자로 새 구독 등록은 추후 공개 예정입니다. 가격 업데이트는 무료로 사용할 수 있어요."
        : null;

  return (
    <div className="min-h-screen gradient-mesh">
      <Header onOpenNotifications={() => setNotifOpen(true)} />

      <main className="mx-auto max-w-6xl px-4 py-6 pb-[calc(6.5rem+env(safe-area-inset-bottom,0px))] sm:px-6">
        {limitMessage && (
          <div className="mb-4 flex items-center justify-between rounded-xl bg-amber-50 px-4 py-3 text-sm text-amber-800 dark:bg-amber-950/30 dark:text-amber-300">
            <span>{limitMessage}</span>
            <button
              onClick={() => setLimitReason(null)}
              className="ml-4 shrink-0 text-amber-600 hover:underline"
            >
              닫기
            </button>
          </div>
        )}

        {activeTab === "home" && <HomeView onAdd={openAdd} onEdit={openEdit} />}
        {activeTab === "subscriptions" && (
          <SubscriptionsView
            onAdd={openAdd}
            onParse={() => setParseOpen(true)}
            onEdit={openEdit}
            onShowPriceHistory={setPriceHistorySub}
          />
        )}
        {activeTab === "family" && <FamilyPanel />}
        {activeTab === "reports" && <ReportsPanel />}
        {activeTab === "settings" && <SettingsPanel />}
      </main>

      {(activeTab === "home" || activeTab === "subscriptions") && (
        <div className="fixed bottom-[calc(5.5rem+env(safe-area-inset-bottom,0px))] right-4 z-30 flex flex-col gap-2 sm:bottom-6">
          <button
            onClick={() => setParseOpen(true)}
            className="flex h-12 w-12 items-center justify-center rounded-2xl border border-emerald-200 bg-white text-emerald-600 shadow-lg dark:border-emerald-800 dark:bg-zinc-900"
            aria-label="문자로 등록"
          >
            <ClipboardPaste className="h-5 w-5" />
          </button>
          <button
            id="tutorial-fab"
            onClick={openAdd}
            className="flex h-14 w-14 items-center justify-center rounded-2xl gradient-brand text-white shadow-xl shadow-emerald-500/30 transition hover:scale-105 active:scale-95"
            aria-label="구독 추가"
          >
            <Plus className="h-6 w-6" />
          </button>
        </div>
      )}

      <BottomNav />
      <PWAInstallPrompt />
      <TutorialOverlay />

      <AddSubscriptionModal
        open={modalOpen}
        onClose={() => { setModalOpen(false); setEditSub(null); }}
        onSave={handleSave}
        editSub={editSub}
      />

      <ParsePaymentModal
        open={parseOpen}
        onClose={() => setParseOpen(false)}
        onSave={handleParseSave}
        onUpdatePrice={handleParseUpdatePrice}
        isPremium={settings.isPremium}
        onNeedPro={() => setLimitReason("pro")}
      />

      <NotificationCenter open={notifOpen} onClose={() => setNotifOpen(false)} />

      <PriceHistoryModal
        subscription={priceHistorySub}
        onClose={() => setPriceHistorySub(null)}
      />

      <footer className="mx-auto max-w-6xl px-4 py-4 pb-24 text-center text-xs text-zinc-400">
        FlowSave · 데이터는 이 기기에만 저장됩니다 · v{APP_VERSION}
      </footer>
    </div>
  );
}
