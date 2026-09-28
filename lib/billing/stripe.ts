import "server-only";
import Stripe from "stripe";
import type { Interval, TierIndex } from "./plans";

/**
 * Lookup keys Stripe — exclusivement `tarineo_*`.
 * Aucun repli `navpit_*`. Si le prix n’existe pas : pas de checkout.
 */
export function lookupPrefix() {
  return "tarineo";
}

export function planLookupKey(
  plan: "starter" | "pro",
  interval: Interval,
  tier: TierIndex = 0,
) {
  const p = lookupPrefix();
  return tier === 0 ? `${p}_${plan}_${interval}` : `${p}_${plan}_${interval}_t${tier}`;
}
export const starterLookupKey = (interval: Interval, tier: TierIndex = 0) =>
  planLookupKey("starter", interval, tier);
export const proLookupKey = (interval: Interval, tier: TierIndex = 0) =>
  planLookupKey("pro", interval, tier);
export const FOUNDER_LOOKUP_KEY = `${lookupPrefix()}_founder`;

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
  if (!lookupKey.startsWith("tarineo_")) {
    console.error("[stripe] lookup refusée (préfixe obligatoire tarineo_)");
    throw new Error(`Prix Stripe introuvable : ${lookupKey}`);
  }
  const { data } = await getStripe().prices.list({ lookup_keys: [lookupKey], active: true, limit: 1 });
  const id = data[0]?.id;
  if (id) return id;
  console.error("[stripe] lookup absente", lookupKey);
  throw new Error(`Prix Stripe introuvable : ${lookupKey}`);
}

/** Prix Pro : `tarineo_pro_{interval}`, puis `tarineo_pro_{interval}_t0` si c’est la clé créée. */
export async function proPriceId(interval: Interval) {
  try {
    return await priceIdFor(proLookupKey(interval));
  } catch {
    return await priceIdFor(`${lookupPrefix()}_pro_${interval}_t0`);
  }
}
