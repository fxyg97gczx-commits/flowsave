import type { Subscription } from "./types";

export function shouldUseSimpleHome(
  subscriptions: Subscription[],
  showFullHome: boolean
): boolean {
  if (showFullHome) return false;
  const active = subscriptions.filter((s) => s.isActive !== false);
  return active.length < 4;
}

export function validateImportData(data: unknown): Subscription[] | null {
  if (!Array.isArray(data)) return null;
  const valid = data.every(
    (item) =>
      item &&
      typeof item === "object" &&
      typeof item.name === "string" &&
      typeof item.amount === "number" &&
      item.renewalDate
  );
  if (!valid) return null;
  return data as Subscription[];
}
