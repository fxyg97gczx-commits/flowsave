"use client";

import { TrendingUp, Calendar, CreditCard, PiggyBank, Users } from "lucide-react";
import {
  formatMoney,
  totalMonthly,
  totalYearly,
  totalPersonalMonthly,
} from "@/lib/utils";
import { getFamilySummary } from "@/lib/family";
import type { Subscription, FamilyMember } from "@/lib/types";

interface StatsOverviewProps {
  subscriptions: Subscription[];
  familyMembers?: FamilyMember[];
}

export function StatsOverview({ subscriptions, familyMembers = [] }: StatsOverviewProps) {
  const active = subscriptions.filter((s) => s.isActive !== false);
  const monthly = totalMonthly(active);
  const personal = totalPersonalMonthly(active);
  const yearly = totalYearly(active);
  const daily = monthly / 30;
  const count = active.length;
  const hasShared = active.some((s) => s.isShared);
  const family = getFamilySummary(active, familyMembers);

  const stats = [
    {
      label: hasShared ? "내 월 부담" : "월 고정비",
      value: formatMoney(hasShared ? personal : monthly, "KRW"),
      sub: hasShared ? `총 ${formatMoney(monthly, "KRW")} 중` : "환산 기준",
      icon: CreditCard,
      color: "text-emerald-600 dark:text-emerald-400",
      bg: "bg-emerald-50 dark:bg-emerald-950/50",
    },
    {
      label: "연 예상 지출",
      value: formatMoney(yearly, "KRW"),
      sub: "12개월 합산",
      icon: TrendingUp,
      color: "text-blue-600 dark:text-blue-400",
      bg: "bg-blue-50 dark:bg-blue-950/50",
    },
    {
      label: "하루 평균",
      value: formatMoney(daily, "KRW"),
      sub: "매일 나가는 돈",
      icon: Calendar,
      color: "text-violet-600 dark:text-violet-400",
      bg: "bg-violet-50 dark:bg-violet-950/50",
    },
    {
      label: familyMembers.length > 0 ? "공유 구독" : "활성 구독",
      value: familyMembers.length > 0 ? `${family.sharedCount}개` : `${count}개`,
      sub: familyMembers.length > 0
        ? `멤버 ${familyMembers.length}명`
        : count > 0 ? `월 ${formatMoney(monthly / count, "KRW")} 평균` : "구독 추가하기",
      icon: familyMembers.length > 0 ? Users : PiggyBank,
      color: "text-amber-600 dark:text-amber-400",
      bg: "bg-amber-50 dark:bg-amber-950/50",
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
      {stats.map((stat, i) => (
        <div
          key={stat.label}
          className="glass animate-fade-in rounded-2xl p-4 sm:p-5"
          style={{ animationDelay: `${i * 80}ms` }}
        >
          <div className={`inline-flex rounded-xl p-2 ${stat.bg}`}>
            <stat.icon className={`h-4 w-4 ${stat.color}`} />
          </div>
          <p className="mt-3 text-xs font-medium text-zinc-500">{stat.label}</p>
          <p className="mt-0.5 text-lg font-bold tracking-tight sm:text-xl">{stat.value}</p>
          <p className="mt-0.5 text-xs text-zinc-400">{stat.sub}</p>
        </div>
      ))}
    </div>
  );
}
