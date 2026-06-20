"use client";

import { useState } from "react";
import { Plus, Users, Trash2, Pencil } from "lucide-react";
import { useAppStore } from "@/lib/store";
import { getFamilySummary } from "@/lib/family";
import { formatMoney } from "@/lib/utils";
import { MEMBER_EMOJIS, COLORS } from "@/lib/constants";
import type { FamilyMember } from "@/lib/types";
import { cn } from "@/lib/utils";

export function FamilyPanel() {
  const {
    subscriptions,
    familyMembers,
    addFamilyMember,
    updateFamilyMember,
    deleteFamilyMember,
    settings,
  } = useAppStore();

  const [showForm, setShowForm] = useState(false);
  const [editMember, setEditMember] = useState<FamilyMember | null>(null);
  const [name, setName] = useState("");
  const [emoji, setEmoji] = useState(MEMBER_EMOJIS[0]);
  const [color, setColor] = useState(COLORS[0]);

  const summary = getFamilySummary(subscriptions, familyMembers);

  const openAdd = () => {
    setEditMember(null);
    setName("");
    setEmoji(MEMBER_EMOJIS[familyMembers.length % MEMBER_EMOJIS.length]);
    setColor(COLORS[familyMembers.length % COLORS.length]);
    setShowForm(true);
  };

  const openEdit = (m: FamilyMember) => {
    setEditMember(m);
    setName(m.name);
    setEmoji(m.emoji);
    setColor(m.color);
    setShowForm(true);
  };

  const handleSave = () => {
    if (!name.trim()) return;
    if (editMember) {
      updateFamilyMember(editMember.id, { name: name.trim(), emoji, color });
    } else {
      addFamilyMember({ name: name.trim(), emoji, color });
    }
    setShowForm(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold">가족·공유 관리</h2>
          <p className="text-xs text-zinc-500">함께 쓰는 구독 비용을 나눠 계산합니다</p>
        </div>
        <button
          onClick={openAdd}
          className="flex items-center gap-1.5 rounded-xl gradient-brand px-3 py-2 text-xs font-semibold text-white shadow-md"
        >
          <Plus className="h-3.5 w-3.5" />
          멤버 추가
        </button>
      </div>

      {familyMembers.length === 0 ? (
        <div className="glass flex flex-col items-center rounded-2xl py-12 text-center">
          <Users className="mb-3 h-10 w-10 text-zinc-300" />
          <p className="text-sm text-zinc-500">가족 멤버를 추가해보세요</p>
          <p className="mt-1 text-xs text-zinc-400">Netflix, iCloud 등 공유 구독 비용을 나눌 수 있어요</p>
          <button onClick={openAdd} className="mt-4 rounded-xl border border-zinc-200 px-4 py-2 text-sm dark:border-zinc-700">
            첫 멤버 추가
          </button>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {summary.perMember.map(({ member, monthly, subscriptions: subs }) => (
              <div key={member.id} className="glass group relative rounded-2xl p-4">
                <div className="flex items-center gap-2">
                  <div
                    className="flex h-10 w-10 items-center justify-center rounded-xl text-lg"
                    style={{ backgroundColor: `${member.color}20` }}
                  >
                    {member.emoji}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-semibold">{member.name}</p>
                    <p className="text-xs text-zinc-400">{subs.length}개 공유</p>
                  </div>
                </div>
                <p className="mt-3 text-lg font-bold">{formatMoney(monthly, "KRW")}</p>
                <p className="text-[10px] text-zinc-400">월 부담금</p>
                <div className="absolute right-2 top-2 flex gap-0.5 opacity-0 transition group-hover:opacity-100">
                  <button
                    onClick={() => openEdit(member)}
                    className="rounded-lg p-1.5 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                  >
                    <Pencil className="h-3 w-3 text-zinc-400" />
                  </button>
                  <button
                    onClick={() => deleteFamilyMember(member.id)}
                    className="rounded-lg p-1.5 hover:bg-red-50 dark:hover:bg-red-950/30"
                  >
                    <Trash2 className="h-3 w-3 text-red-400" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="glass rounded-2xl p-5">
            <h3 className="mb-3 text-sm font-semibold">공유 구독 요약</h3>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-2xl font-bold text-emerald-600">{summary.sharedCount}</p>
                <p className="text-[10px] text-zinc-400">공유 구독</p>
              </div>
              <div>
                <p className="text-2xl font-bold">{formatMoney(summary.totalShared, "KRW")}</p>
                <p className="text-[10px] text-zinc-400">총 월 비용</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-blue-600">{formatMoney(summary.myShare, "KRW")}</p>
                <p className="text-[10px] text-zinc-400">내 부담금</p>
              </div>
            </div>
          </div>
        </>
      )}

      {!settings.isPremium && familyMembers.length >= 2 && (
        <p className="text-center text-xs text-zinc-400">
          가족 멤버 무제한 관리는 추후 제공 예정입니다
        </p>
      )}

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40" onClick={() => setShowForm(false)} />
          <div className="relative z-10 w-full max-w-sm rounded-2xl bg-white p-5 shadow-2xl dark:bg-zinc-900">
            <h3 className="mb-4 font-bold">{editMember ? "멤버 수정" : "멤버 추가"}</h3>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="이름"
              className="mb-3 w-full rounded-xl border border-zinc-200 px-4 py-2.5 text-sm dark:border-zinc-700 dark:bg-zinc-800"
            />
            <p className="mb-1.5 text-xs text-zinc-400">이모지</p>
            <div className="mb-3 flex flex-wrap gap-1.5">
              {MEMBER_EMOJIS.map((e) => (
                <button
                  key={e}
                  onClick={() => setEmoji(e)}
                  className={cn(
                    "rounded-lg px-2 py-1 text-lg",
                    emoji === e ? "bg-emerald-100 ring-2 ring-emerald-500" : "hover:bg-zinc-100 dark:hover:bg-zinc-800"
                  )}
                >
                  {e}
                </button>
              ))}
            </div>
            <p className="mb-1.5 text-xs text-zinc-400">색상</p>
            <div className="mb-4 flex gap-2">
              {COLORS.map((c) => (
                <button
                  key={c}
                  onClick={() => setColor(c)}
                  className={cn("h-7 w-7 rounded-full", color === c && "ring-2 ring-offset-2 ring-emerald-500")}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
            <button onClick={handleSave} className="w-full rounded-xl gradient-brand py-2.5 text-sm font-semibold text-white">
              저장
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
