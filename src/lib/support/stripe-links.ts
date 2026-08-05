export const SUPPORT_AMOUNTS = [500, 1000, 3000] as const;

export type SupportAmount = (typeof SUPPORT_AMOUNTS)[number];

const STRIPE_SUPPORT_URLS: Record<SupportAmount, string | undefined> = {
  500: process.env.NEXT_PUBLIC_STRIPE_SUPPORT_500,
  1000: process.env.NEXT_PUBLIC_STRIPE_SUPPORT_1000,
  3000: process.env.NEXT_PUBLIC_STRIPE_SUPPORT_3000,
};

export function getStripeSupportUrl(amount: SupportAmount): string | null {
  const url = STRIPE_SUPPORT_URLS[amount]?.trim();
  return url || null;
}

export function hasAnySupportCheckout(): boolean {
  return SUPPORT_AMOUNTS.some((amount) => Boolean(getStripeSupportUrl(amount)));
}

export function formatSupportAmount(amount: number): string {
  return `${amount.toLocaleString("ja-JP")}円`;
}
