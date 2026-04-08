/**
 * Plotr subscription products and prices.
 * These are created in Stripe as recurring subscription prices.
 * Price IDs are looked up by tier name at checkout time.
 */

export type PlanTier = "pro" | "trade";

export interface PlanConfig {
  name: string;
  tier: PlanTier;
  monthlyPriceGBP: number;
  /** Stripe price ID — set via env or created dynamically */
  stripePriceId: string;
  features: string[];
}

export const PLANS: Record<PlanTier, PlanConfig> = {
  pro: {
    name: "Pro",
    tier: "pro",
    monthlyPriceGBP: 9.99,
    stripePriceId: process.env.STRIPE_PRO_PRICE_ID ?? "",
    features: [
      "Unlimited room analyses",
      "3D room renders",
      "Full materials lists with trade pricing",
      "Supplier directory access",
      "Tradesperson directory access",
    ],
  },
  trade: {
    name: "Trade",
    tier: "trade",
    monthlyPriceGBP: 24.99,
    stripePriceId: process.env.STRIPE_TRADE_PRICE_ID ?? "",
    features: [
      "Everything in Pro",
      "Trade account pricing",
      "Priority tradesperson listings",
      "Bulk project management",
      "Affiliate commission dashboard",
      "White-label materials reports",
    ],
  },
};
