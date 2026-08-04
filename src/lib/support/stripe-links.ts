export const SUPPORT_AMOUNTS = [500, 1000, 3000] as const;

export type SupportAmount = (typeof SUPPORT_AMOUNTS)[number];

const STRIPE_SUPPORT_ENV_KEYS: Record<SupportAmount, string> = {
  500: "NEXT_PUBLIC_STRIPE_SUPPORT_500",
  1000: "NEXT_PUBLIC_STRIPE_SUPPORT_1000",
  3000: "NEXT_PUBLIC_STRIPE_SUPPORT_3000",
};

export function getStripeSupportUrl(amount: SupportAmount): string | null {
  const key = STRIPE_SUPPORT_ENV_KEYS[amount];
  const url = process.env[key]?.trim();
  return url || null;
}

export function hasAnySupportCheckout(): boolean {
  return SUPPORT_AMOUNTS.some((amount) => Boolean(getStripeSupportUrl(amount)));
}

export function formatSupportAmount(amount: number): string {
  return `${amount.toLocaleString("ja-JP")}円`;
}
