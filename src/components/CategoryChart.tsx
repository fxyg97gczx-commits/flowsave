"use client";

import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import { categoryBreakdown, formatMoney } from "@/lib/utils";
import { CATEGORIES } from "@/lib/constants";
import type { Subscription } from "@/lib/types";

const CHART_COLORS = [
  "#10b981", "#3b82f6", "#8b5cf6", "#f59e0b",
  "#ef4444", "#ec4899", "#06b6d4", "#84cc16",
];

interface CategoryChartProps {
  subscriptions: Subscription[];
}

export function CategoryChart({ subscriptions }: CategoryChartProps) {
  const data = categoryBreakdown(subscriptions).map((item, i) => ({
    name: CATEGORIES[item.category as keyof typeof CATEGORIES]?.label ?? item.category,
    value: Math.round(item.amount),
    emoji: CATEGORIES[item.category as keyof typeof CATEGORIES]?.emoji ?? "📦",
    color: CHART_COLORS[i % CHART_COLORS.length],
  }));

  if (data.length === 0) {
    return (
      <div className="glass flex h-64 items-center justify-center rounded-2xl">
        <p className="text-sm text-zinc-400">구독을 추가하면 차트가 표시됩니다</p>
      </div>
    );
  }

  return (
    <div className="glass rounded-2xl p-5">
      <h3 className="mb-4 text-sm font-semibold text-zinc-700 dark:text-zinc-300">
        카테고리별 월 지출
      </h3>
      <div className="flex flex-col items-center gap-4 sm:flex-row">
        <div className="h-48 w-full sm:h-52 sm:w-1/2">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={80}
                paddingAngle={3}
                dataKey="value"
              >
                {data.map((entry, i) => (
                  <Cell key={i} fill={entry.color} stroke="transparent" />
                ))}
              </Pie>
              <Tooltip
                formatter={(value: number) => formatMoney(value, "KRW")}
                contentStyle={{
                  borderRadius: "12px",
                  border: "none",
                  boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="flex w-full flex-col gap-2 sm:w-1/2">
          {data.map((item) => (
            <div key={item.name} className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <div
                  className="h-2.5 w-2.5 rounded-full"
                  style={{ backgroundColor: item.color }}
                />
                <span>
                  {item.emoji} {item.name}
                </span>
              </div>
              <span className="font-medium">{formatMoney(item.value, "KRW")}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
