import Stripe from "stripe";

// Stripe is optional until keys are provided. When unset, routes return 503
// and the UI shows checkout as unavailable rather than crashing.
export const stripeEnabled = !!process.env.STRIPE_SECRET_KEY;

export const stripe = stripeEnabled
  ? new Stripe(process.env.STRIPE_SECRET_KEY as string)
  : null;

export const PRICE_IDS: Record<"core" | "premium", string | undefined> = {
  core: process.env.STRIPE_PRICE_CORE,
  premium: process.env.STRIPE_PRICE_PREMIUM,
};

export type Tier = "free" | "core" | "premium";

// Map a Stripe price ID back to a subscription tier.
export function tierForPrice(priceId: string | null | undefined): Tier {
  if (!priceId) return "free";
  if (priceId === PRICE_IDS.core) return "core";
  if (priceId === PRICE_IDS.premium) return "premium";
  return "free";
}
