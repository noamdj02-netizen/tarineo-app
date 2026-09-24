// Crée (une seule fois) les produits et prix Stripe de Navpit, repérés par leur « lookup key ».
// Relançable sans risque : un prix déjà présent n'est pas recréé.
// Usage : STRIPE_SECRET_KEY=sk_test_… node scripts/stripe-setup.mjs

import Stripe from "stripe";

const key = process.env.STRIPE_SECRET_KEY;
if (!key) {
  console.error("STRIPE_SECRET_KEY manquant.");
  process.exit(1);
}
const stripe = new Stripe(key);

// Mêmes montants que lib/billing/plans.ts (en centimes).
const STARTER = { month: 1500, year: 15000 };
const PRO = { month: 3000, year: 30000 };
const FOUNDER = 14900;

async function product(name, description) {
  const found = await stripe.products.search({ query: `metadata['navpit']:'${name}'` });
  if (found.data[0]) return found.data[0].id;
  const p = await stripe.products.create({ name, description, metadata: { navpit: name } });
  return p.id;
}

async function price(lookup_key, params) {
  const { data } = await stripe.prices.list({ lookup_keys: [lookup_key], limit: 1 });
  if (data[0]) {
    console.log(`= ${lookup_key} existe déjà (${data[0].id})`);
    return;
  }
  const p = await stripe.prices.create({ currency: "eur", lookup_key, ...params });
  console.log(`+ ${lookup_key} créé (${p.id})`);
}

const starter = await product(
  "Navpit Création",
  "6 projets, 300 questions IA/mois, 100 schémas.",
);
for (const interval of ["month", "year"]) {
  await price(`navpit_starter_${interval}`, {
    product: starter,
    unit_amount: STARTER[interval],
    recurring: { interval },
    nickname: `Création ${interval === "month" ? "mensuel" : "annuel"}`,
  });
}

const pro = await product("Navpit Pro", "Projets et schémas illimités, copilote IA, agenda.");
for (const interval of ["month", "year"]) {
  await price(`navpit_pro_${interval}`, {
    product: pro,
    unit_amount: PRO[interval],
    recurring: { interval },
    nickname: `Pro ${interval === "month" ? "mensuel" : "annuel"}`,
  });
}

const founder = await product("Navpit Fondateur", "Accès Pro à vie, un seul paiement.");
await price("navpit_founder", { product: founder, unit_amount: FOUNDER, nickname: "Fondateur à vie" });

console.log("Terminé.");
