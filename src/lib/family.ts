import type { FamilyMember, Subscription } from "./types";
import { monthlyAmount } from "./utils";

export function myMonthlyShare(sub: Subscription): number {
  const monthly = monthlyAmount(sub);
  if (!sub.isShared || !sub.mySharePercent) return monthly;
  return monthly * (sub.mySharePercent / 100);
}

export function totalMyMonthly(subs: Subscription[]): number {
  return subs
    .filter((s) => s.isActive !== false)
    .reduce((sum, s) => sum + myMonthlyShare(s), 0);
}

export function getMemberSubscriptions(
  subs: Subscription[],
  memberId: string
): Subscription[] {
  return subs.filter(
    (s) => s.isShared && s.sharedMemberIds?.includes(memberId)
  );
}

export function getMemberMonthlyCost(
  subs: Subscription[],
  memberId: string,
  members: FamilyMember[]
): number {
  const memberCount = members.length || 1;
  return subs
    .filter((s) => s.isShared && s.sharedMemberIds?.includes(memberId))
    .reduce((sum, s) => {
      const shareCount = s.sharedMemberIds?.length || memberCount;
      return sum + monthlyAmount(s) / shareCount;
    }, 0);
}

export function getFamilySummary(
  subs: Subscription[],
  members: FamilyMember[]
) {
  const shared = subs.filter((s) => s.isShared && s.isActive !== false);
  const totalShared = shared.reduce((sum, s) => sum + monthlyAmount(s), 0);
  const myShare = shared.reduce((sum, s) => sum + myMonthlyShare(s), 0);

  const perMember = members.map((m) => ({
    member: m,
    monthly: getMemberMonthlyCost(subs, m.id, members),
    subscriptions: getMemberSubscriptions(subs, m.id),
  }));

  return { totalShared, myShare, perMember, sharedCount: shared.length };
}
