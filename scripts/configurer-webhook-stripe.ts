/**
 * Crée (ou retrouve) le webhook Stripe de production pour Tarineo.
 *
 * Usage :
 *   npx tsx scripts/configurer-webhook-stripe.ts
 *   npx tsx scripts/configurer-webhook-stripe.ts --write-env
 *   WEBHOOK_URL=https://app.tarineo.com/api/stripe/webhook npx tsx scripts/configurer-webhook-stripe.ts
 */
import { readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { config } from "dotenv";
import Stripe from "stripe";

config({ path: resolve(process.cwd(), ".env") });

const EVENEMENTS = [
  "setup_intent.succeeded",
  "customer.subscription.updated",
  "customer.subscription.deleted",
  "invoice.payment_failed",
  "invoice.paid",
] as const;

const URL_DEFAUT = "https://app.tarineo.com/api/stripe/webhook";

async function listerWebhooks(stripe: Stripe): Promise<Stripe.WebhookEndpoint[]> {
  const resultats: Stripe.WebhookEndpoint[] = [];
  let startingAfter: string | undefined;
  for (;;) {
    const page = await stripe.webhookEndpoints.list({ limit: 100, starting_after: startingAfter });
    resultats.push(...page.data);
    if (!page.has_more) break;
    startingAfter = page.data[page.data.length - 1]?.id;
  }
  return resultats;
}

function mettreAJourEnv(chemin: string, secret: string) {
  let contenu = readFileSync(chemin, "utf8");
  const ligne = `STRIPE_WEBHOOK_SECRET="${secret}"`;
  if (/^STRIPE_WEBHOOK_SECRET=.*$/m.test(contenu)) {
    contenu = contenu.replace(/^STRIPE_WEBHOOK_SECRET=.*$/m, ligne);
  } else {
    contenu = contenu.replace(
      /(# --- Stripe[\s\S]*?STRIPE_SECRET_KEY="")/,
      `$1\n${ligne}`,
    );
  }
  writeFileSync(chemin, contenu);
}

async function main() {
  const cle = process.env.STRIPE_SECRET_KEY;
  if (!cle) {
    console.error("STRIPE_SECRET_KEY manquant. Ajoutez-le dans .env ou en variable d'environnement.");
    process.exit(1);
  }

  const url = process.env.WEBHOOK_URL ?? URL_DEFAUT;
  const stripe = new Stripe(cle);
  const existants = await listerWebhooks(stripe);
  const deja = existants.find((w) => w.url === url && w.status !== "disabled");

  if (deja) {
    console.log(`Webhook déjà présent : ${deja.id} → ${deja.url}`);
    console.log("Événements :", deja.enabled_events.join(", "));
    console.log(
      "\nLe secret de signature (whsec_…) n'est affiché qu'à la création.",
      "Dans Stripe → Developers → Webhooks → votre endpoint → « Révéler » ou « Roll secret ».",
    );
    console.log("\nPuis : node scripts/sync-vercel-env.mjs");
    return;
  }

  const endpoint = await stripe.webhookEndpoints.create({
    url,
    enabled_events: [...EVENEMENTS],
    description: "Tarineo — abonnements (SetupIntent + cycle de vie)",
  });

  console.log(`Webhook créé : ${endpoint.id}`);
  console.log(`URL : ${endpoint.url}`);
  console.log(`Secret : ${endpoint.secret}`);
  console.log("\nCollez dans .env :");
  console.log(`STRIPE_WEBHOOK_SECRET="${endpoint.secret}"`);
  console.log("\nPuis synchronisez Vercel : node scripts/sync-vercel-env.mjs");

  if (process.argv.includes("--write-env")) {
    const chemin = resolve(process.cwd(), ".env");
    mettreAJourEnv(chemin, endpoint.secret ?? "");
    console.log(`\n✓ .env mis à jour (${chemin})`);
  }
}

main().catch((erreur) => {
  console.error(erreur);
  process.exit(1);
});
