import type { Category, Currency, ParsedPayment, Subscription } from "./types";
import { KNOWN_SERVICES } from "./constants";
import { toKRW } from "./utils";

export function serviceKey(name: string): string {
  for (const svc of KNOWN_SERVICES) {
    if (svc.pattern.test(name)) return svc.name.toLowerCase();
  }
  return name.trim().toLowerCase();
}

export function findMatchingSubscription(
  parsed: ParsedPayment,
  subscriptions: Subscription[]
): Subscription | null {
  const parsedKey = serviceKey(parsed.name);

  for (const sub of subscriptions) {
    if (sub.isActive === false) continue;

    const subKey = serviceKey(sub.name);
    if (parsedKey === subKey) return sub;

    if (
      parsedKey.includes(subKey) ||
      subKey.includes(parsedKey) ||
      sub.name.toLowerCase() === parsed.name.toLowerCase()
    ) {
      return sub;
    }
  }

  return null;
}

export function isPaymentAmountDifferent(
  sub: Subscription,
  parsed: ParsedPayment
): boolean {
  return toKRW(parsed.amount, parsed.currency) !== toKRW(sub.amount, sub.currency);
}

function extractAmount(text: string): { amount: number; currency: Currency } | null {
  const usd = text.match(/\$\s*([\d,.]+)/);
  if (usd) return { amount: parseFloat(usd[1].replace(/,/g, "")), currency: "USD" };

  const krw = text.match(/([\d,]+)\s*원/);
  if (krw) return { amount: parseInt(krw[1].replace(/,/g, ""), 10), currency: "KRW" };

  const numOnly = text.match(/([\d,]+)\s*(?:KRW|krw|₩)/);
  if (numOnly) return { amount: parseInt(numOnly[1].replace(/,/g, ""), 10), currency: "KRW" };

  const bare = text.match(/(?:^|\s)([\d,]{3,})(?:\s|$|원)/);
  if (bare) return { amount: parseInt(bare[1].replace(/,/g, ""), 10), currency: "KRW" };

  return null;
}

function extractDate(text: string): string | undefined {
  const m1 = text.match(/(\d{2})[/.-](\d{2})/);
  if (m1) {
    const year = new Date().getFullYear();
    return `${year}-${m1[1]}-${m1[2]}`;
  }
  const m2 = text.match(/(\d{4})[/.-](\d{2})[/.-](\d{2})/);
  if (m2) return `${m2[1]}-${m2[2]}-${m2[3]}`;
  return undefined;
}

function detectService(text: string): { name: string; category: Category } | null {
  for (const svc of KNOWN_SERVICES) {
    if (svc.pattern.test(text)) {
      return { name: svc.name, category: svc.category };
    }
  }
  const merchant = text.match(/(?:승인|결제|이체)\s+([가-힣a-zA-Z0-9+.\s]{2,20})/);
  if (merchant) return { name: merchant[1].trim(), category: "other" };
  return null;
}

export function parsePaymentText(raw: string): ParsedPayment | null {
  const text = raw.trim();
  if (!text) return null;

  const amountInfo = extractAmount(text);
  if (!amountInfo || amountInfo.amount <= 0) return null;

  const service = detectService(text);
  const date = extractDate(text);

  let confidence = 0.5;
  if (service) confidence += 0.3;
  if (date) confidence += 0.1;
  if (amountInfo.amount > 0) confidence += 0.1;

  return {
    name: service?.name ?? "알 수 없는 구독",
    amount: amountInfo.amount,
    currency: amountInfo.currency,
    date,
    category: service?.category,
    confidence: Math.min(confidence, 1),
    raw: text,
  };
}

export function parseMultipleTexts(texts: string[]): ParsedPayment[] {
  return texts
    .map((t) => parsePaymentText(t))
    .filter((p): p is ParsedPayment => p !== null);
}
