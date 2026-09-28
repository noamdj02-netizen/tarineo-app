// Crée (une seule fois) les produits et lookup keys TARINEO.
// Relançable : un objet déjà présent n'est pas recréé.
// Usage : node --env-file=.env.local scripts/stripe-setup.mjs
// Les Price ID sont générés par Stripe — ne pas les copier à la main dans le code.

import Stripe from "stripe";

const key = process.env.STRIPE_SECRET_KEY?.trim();
if (!key) {
  console.error("STRIPE_SECRET_KEY manquant.");
  process.exit(1);
}
const stripe = new Stripe(key);
const live = key.startsWith("sk_live_") || key.startsWith("rk_live_");
const appUrl = (process.env.NEXT_PUBLIC_APP_URL || "https://app.tarineo.com").replace(/\/$/, "");

// Mêmes montants que lib/billing/plans.ts (en centimes). Index = palier fidélité.
const STARTER = { month: [1500, 1200, 900], year: [15000, 12000, 9000] };
const PRO = { month: [3000, 2400, 1800], year: [30000, 24000, 18000] };
const FOUNDER = 14900;

const lookup = (plan, interval, tier) =>
  tier === 0 ? `tarineo_${plan}_${interval}` : `tarineo_${plan}_${interval}_t${tier}`;

async function product(name, description) {
  try {
    const found = await stripe.products.search({ query: `metadata['tarineo']:'${name}'` });
    if (found.data[0]) return found.data[0];
  } catch {
    const listed = await stripe.products.list({ limit: 100, active: true });
    const hit = listed.data.find((p) => p.metadata?.tarineo === name);
    if (hit) return hit;
  }
  return stripe.products.create({ name, description, metadata: { tarineo: name } });
}

async function price(lookup_key, params) {
  const { data } = await stripe.prices.list({ lookup_keys: [lookup_key], limit: 1 });
  if (data[0]) {
    console.log(`= ${lookup_key} existe déjà (${data[0].id})`);
    return data[0];
  }
  const p = await stripe.prices.create({ currency: "eur", lookup_key, ...params });
  console.log(`+ ${lookup_key} créé (${p.id})`);
  return p;
}

async function recurringPrices(planName, productId, amounts) {
  const ids = { month: [], year: [] };
  for (const interval of ["month", "year"]) {
    for (const tier of [0, 1, 2]) {
      const yearLabel = ["1re année", "2e année", "dès la 3e"][tier];
      const p = await price(lookup(planName, interval, tier), {
        product: productId,
        unit_amount: amounts[interval][tier],
        recurring: { interval },
        nickname: `${planName} ${interval === "month" ? "mensuel" : "annuel"} · ${yearLabel}`,
      });
      ids[interval][tier] = p.id;
    }
  }
  return ids;
}

console.log(`Mode ${live ? "LIVE" : "TEST"}`);

const starter = await product(
  "TARINEO Création",
  "Documents, historique d’achats, suivi de marge. Prix fidélité dégressif.",
);
const starterPrices = await recurringPrices("starter", starter.id, STARTER);

const pro = await product("TARINEO Pro", "Tous les distributeurs, devis client, analyses. Prix fidélité dégressif.");
const proPrices = await recurringPrices("pro", pro.id, PRO);

const founder = await product("TARINEO Fondateur", "Accès Pro à vie, un seul paiement.");
await price("tarineo_founder", { product: founder.id, unit_amount: FOUNDER, nickname: "Fondateur à vie" });

const portals = await stripe.billingPortal.configurations.list({ active: true, limit: 1 });
if (portals.data[0]) {
  console.log(`= portail client déjà actif (${portals.data[0].id})`);
} else {
  try {
    const portal = await stripe.billingPortal.configurations.create({
      business_profile: {
        headline: "TARINEO — gérer ton abonnement",
        privacy_policy_url: `${appUrl}/confidentialite`,
        terms_of_service_url: `${appUrl}/cgv`,
      },
      features: {
        invoice_history: { enabled: true },
        payment_method_update: { enabled: true },
        customer_update: { enabled: true, allowed_updates: ["email", "address"] },
        subscription_cancel: { enabled: true, mode: "at_period_end" },
        subscription_update: {
          enabled: true,
          default_allowed_updates: ["price", "promotion_code"],
          proration_behavior: "none",
          products: [
            { product: starter.id, prices: [starterPrices.month[0], starterPrices.year[0]] },
            { product: pro.id, prices: [proPrices.month[0], proPrices.year[0]] },
          ],
        },
      },
    });
    console.log(`+ portail client créé (${portal.id})`);
  } catch (e) {
    console.error("! portail client :", e instanceof Error ? e.message : e);
  }
}

const webhookUrl = `${appUrl}/api/billing/webhook`;
try {
  const hooks = await stripe.webhookEndpoints.list({ limit: 100 });
  const existingHook = hooks.data.find((h) => h.url === webhookUrl);
  if (existingHook) {
    console.log(`= webhook déjà enregistré (${existingHook.id})`);
  } else {
    const hook = await stripe.webhookEndpoints.create({
      url: webhookUrl,
      enabled_events: [
        "checkout.session.completed",
        "customer.subscription.created",
        "customer.subscription.updated",
        "customer.subscription.deleted",
        "invoice.paid",
        "invoice.payment_failed",
      ],
      metadata: { tarineo: "app" },
    });
    console.log(`+ webhook créé (${hook.id})`);
    if (hook.secret) {
      console.log("");
      console.log("STRIPE_WEBHOOK_SECRET (à coller dans Vercel, une seule fois) :");
      console.log(hook.secret);
    }
  }
} catch (e) {
  console.error("! webhook :", e instanceof Error ? e.message : e);
}

console.log("Terminé.");
