"use client";

import { StatsOverview } from "./StatsOverview";
import { CategoryChart } from "./CategoryChart";
import { UpcomingRenewals } from "./UpcomingRenewals";
import { SavingsInsight } from "./SavingsInsight";
import { NextPaymentWidget } from "./NextPaymentWidget";
import { BudgetWidget } from "./BudgetWidget";
import { TrialAlerts } from "./TrialAlerts";
import { AdBanner, NativeAdCard } from "./AdBanner";
import { SimpleHomeView } from "./SimpleHomeView";
import { useAppStore } from "@/lib/store";
import { shouldUseSimpleHome } from "@/lib/ux";
import type { Subscription } from "@/lib/types";

interface HomeViewProps {
  onAdd: () => void;
  onEdit: (sub: Subscription) => void;
}

export function HomeView({ onAdd, onEdit }: HomeViewProps) {
  const { subscriptions, familyMembers, settings, setActiveTab } = useAppStore();
  const active = subscriptions.filter((s) => s.isActive !== false);

  if (shouldUseSimpleHome(subscriptions, settings.showFullHome ?? false)) {
    return <SimpleHomeView onAdd={onAdd} onEdit={onEdit} />;
  }

  return (
    <div className="space-y-6">
      <NextPaymentWidget
        subscriptions={active}
        onSelect={onEdit}
        onViewAll={() => setActiveTab("subscriptions")}
      />

      <BudgetWidget />

      <TrialAlerts subscriptions={subscriptions} />

      <StatsOverview subscriptions={subscriptions} familyMembers={familyMembers} />

      <AdBanner placement="home-banner" />

      <div className="grid gap-6 lg:grid-cols-2">
        <CategoryChart subscriptions={active} />
        <UpcomingRenewals subscriptions={active} onSelect={onEdit} />
      </div>

      <NativeAdCard placement="home-native" />

      <SavingsInsight subscriptions={active} />
    </div>
  );
}
