import "server-only";
import Stripe from "stripe";
import type { Interval, TierIndex } from "./plans";

/**
 * Clés « lookup » des prix Stripe (créés par scripts/stripe-setup.mjs).
 * Palier 0 = prix d’entrée (`navpit_pro_month`), paliers suivants = `_t1` / `_t2`.
 */
export function planLookupKey(
  plan: "starter" | "pro",
  interval: Interval,
  tier: TierIndex = 0,
) {
  return tier === 0 ? `navpit_${plan}_${interval}` : `navpit_${plan}_${interval}_t${tier}`;
}
export const starterLookupKey = (interval: Interval, tier: TierIndex = 0) =>
  planLookupKey("starter", interval, tier);
export const proLookupKey = (interval: Interval, tier: TierIndex = 0) =>
  planLookupKey("pro", interval, tier);
export const FOUNDER_LOOKUP_KEY = "navpit_founder";

let client: Stripe | null = null;

export function isStripeConfigured() {
  const key = process.env.STRIPE_SECRET_KEY?.trim() ?? "";
  return /^(sk|rk)_(test|live)_/.test(key) && key.length >= 80 && key.length <= 256;
}

export function getStripe() {
  const key = process.env.STRIPE_SECRET_KEY?.trim();
  if (!key) throw new Error("STRIPE_SECRET_KEY manquant");
  client ??= new Stripe(key);
  return client;
}

export async function priceIdFor(lookupKey: string) {
  const { data } = await getStripe().prices.list({ lookup_keys: [lookupKey], active: true, limit: 1 });
  const id = data[0]?.id;
  if (!id) throw new Error(`Prix Stripe introuvable : ${lookupKey}`);
  return id;
}

/** Résout le prix Pro (clé actuelle, puis ancien palier `_t0` si encore en base). */
export async function proPriceId(interval: Interval) {
  try {
    return await priceIdFor(proLookupKey(interval));
  } catch {
    return await priceIdFor(`navpit_pro_${interval}_t0`);
  }
}
