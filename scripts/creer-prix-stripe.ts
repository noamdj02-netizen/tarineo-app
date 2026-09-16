/**
 * Crée (ou retrouve) les produits et prices Tarineo dans Stripe, puis affiche les
 * variables à coller dans .env. Idempotent : relancer ne duplique pas si les metadata
 * `app=tarineo` + `plan` + `interval` existent déjà.
 *
 * Usage :
 *   STRIPE_SECRET_KEY=sk_test_… npx tsx scripts/creer-prix-stripe.ts
 *   npx tsx scripts/creer-prix-stripe.ts --write-env   # met à jour .env automatiquement
 */
import { readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import Stripe from "stripe";

const PLANS = [
  { plan: "starter", nom: "Tarineo Starter", mensuel: 1700, annuel: 16300 },
  { plan: "pro", nom: "Tarineo Pro", mensuel: 2900, annuel: 27800 },
  { plan: "equipe", nom: "Tarineo Équipe", mensuel: 4900, annuel: 47000 },
] as const;

const CLE_ENV: Record<string, { mensuel: string; annuel: string }> = {
  starter: { mensuel: "STRIPE_PRICE_STARTER", annuel: "STRIPE_PRICE_STARTER_ANNUEL" },
  pro: { mensuel: "STRIPE_PRICE_PRO", annuel: "STRIPE_PRICE_PRO_ANNUEL" },
  equipe: { mensuel: "STRIPE_PRICE_PREMIUM", annuel: "STRIPE_PRICE_PREMIUM_ANNUEL" },
};

async function listerTout<T extends { id: string }>(
  lister: (params: Stripe.PaginationParams) => Stripe.ApiListPromise<T>
): Promise<T[]> {
  const resultats: T[] = [];
  let startingAfter: string | undefined;
  for (;;) {
    const page = await lister({ limit: 100, starting_after: startingAfter });
    resultats.push(...page.data);
    if (!page.has_more) break;
    startingAfter = page.data[page.data.length - 1]?.id;
  }
  return resultats;
}

async function main() {
  const cle = process.env.STRIPE_SECRET_KEY;
  if (!cle?.startsWith("sk_")) {
    console.error("STRIPE_SECRET_KEY manquante ou invalide. Exemple :");
    console.error("  STRIPE_SECRET_KEY=sk_test_… npx tsx scripts/creer-prix-stripe.ts --write-env");
    process.exit(1);
  }

  const stripe = new Stripe(cle);
  console.log(`Mode : ${cle.startsWith("sk_live_") ? "LIVE" : "test"}\n`);

  const produits = await listerTout((p) => stripe.products.list({ ...p, active: true }));
  const prices = await listerTout((p) => stripe.prices.list({ ...p, active: true, type: "recurring" }));

  const vars: Record<string, string> = {};

  for (const plan of PLANS) {
    let produit = produits.find((p) => p.metadata?.app === "tarineo" && p.metadata?.plan === plan.plan);
    if (!produit) {
      produit = await stripe.products.create({
        name: plan.nom,
        metadata: { app: "tarineo", plan: plan.plan },
      });
      console.log(`Produit créé : ${produit.name} (${produit.id})`);
    } else {
      console.log(`Produit existant : ${produit.name} (${produit.id})`);
    }

    for (const { interval, montant } of [
      { interval: "month" as const, montant: plan.mensuel },
      { interval: "year" as const, montant: plan.annuel },
    ]) {
      const existant = prices.find(
        (pr) =>
          pr.product === produit!.id &&
          pr.metadata?.app === "tarineo" &&
          pr.metadata?.plan === plan.plan &&
          pr.metadata?.interval === interval &&
          pr.unit_amount === montant &&
          pr.currency === "eur"
      );

      const price =
        existant ??
        (await stripe.prices.create({
          product: produit.id,
          unit_amount: montant,
          currency: "eur",
          recurring: { interval },
          metadata: { app: "tarineo", plan: plan.plan, interval },
        }));

      const cleEnv = interval === "month" ? CLE_ENV[plan.plan].mensuel : CLE_ENV[plan.plan].annuel;
      vars[cleEnv] = price.id;
      const euros = (montant / 100).toLocaleString("fr-FR", { style: "currency", currency: "EUR" });
      console.log(`  ${interval === "month" ? "Mensuel" : "Annuel "} ${euros} → ${price.id}${existant ? " (existant)" : " (créé)"}`);
    }
    console.log();
  }

  console.log("--- Variables .env ---");
  for (const [k, v] of Object.entries(vars)) {
    console.log(`${k}="${v}"`);
  }

  if (process.argv.includes("--write-env")) {
    const chemin = resolve(process.cwd(), ".env");
    let env = readFileSync(chemin, "utf8");
    for (const [k, v] of Object.entries(vars)) {
      const re = new RegExp(`^${k}="[^"]*"`, "m");
      if (re.test(env)) env = env.replace(re, `${k}="${v}"`);
      else env += `\n${k}="${v}"`;
    }
    if (!/^STRIPE_SECRET_KEY="/m.test(env) || /STRIPE_SECRET_KEY=""/m.test(env)) {
      env = env.replace(/^STRIPE_SECRET_KEY="[^"]*"/m, `STRIPE_SECRET_KEY="${cle}"`);
    }
    writeFileSync(chemin, env);
    console.log(`\n.env mis à jour (${chemin}).`);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
