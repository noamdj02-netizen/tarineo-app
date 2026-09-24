import "server-only";
import Stripe from "stripe";
import type { Interval, TierIndex } from "./plans";

/**
 * Clés « lookup » des prix Stripe (créés par scripts/stripe-setup.mjs).
 * Mêmes noms dans supabase/functions/stripe-webhook/index.ts.
 */
export const starterLookupKey = (interval: Interval) => `navpit_starter_${interval}`;
/** Prix Pro actuel (30 € / 300 €). */
export const proLookupKey = (interval: Interval, tier?: TierIndex) =>
  tier !== undefined ? `navpit_pro_${interval}_t${tier}` : `navpit_pro_${interval}`;
export const FOUNDER_LOOKUP_KEY = "navpit_founder";

let client: Stripe | null = null;

export function isStripeConfigured() {
  return Boolean(process.env.STRIPE_SECRET_KEY);
}

export function getStripe() {
  const key = process.env.STRIPE_SECRET_KEY;
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

/** Résout le prix Pro (nouvelle clé puis anciens paliers fidélité). */
export async function proPriceId(interval: Interval) {
  try {
    return await priceIdFor(proLookupKey(interval));
  } catch {
    return await priceIdFor(proLookupKey(interval, 0));
  }
}
