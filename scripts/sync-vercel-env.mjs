/**
 * Synchronise les variables .env locales vers Vercel (production).
 * Usage : node scripts/sync-vercel-env.mjs
 */
import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { parse } from "dotenv";

const PROD_URL = "https://tarineo-app-chi.vercel.app";

const CLES = [
  "DATABASE_URL",
  "DIRECT_URL",
  "AUTH_SECRET",
  "AUTH_URL",
  "GOOGLE_CLIENT_ID",
  "GOOGLE_CLIENT_SECRET",
  "RESEND_API_KEY",
  "EMAIL_FROM",
  "CONTACT_ENTREPRISE_EMAIL",
  "ANTHROPIC_API_KEY",
  "SUPABASE_URL",
  "SUPABASE_SERVICE_ROLE_KEY",
  "SUPABASE_STORAGE_BUCKET",
  "STRIPE_SECRET_KEY",
  "STRIPE_WEBHOOK_SECRET",
  "NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY",
  "STRIPE_PRICE_STARTER",
  "STRIPE_PRICE_PRO",
  "STRIPE_PRICE_PREMIUM",
  "STRIPE_PRICE_STARTER_ANNUEL",
  "STRIPE_PRICE_PRO_ANNUEL",
  "STRIPE_PRICE_PREMIUM_ANNUEL",
];

const local = parse(readFileSync(".env", "utf8"));
local.AUTH_URL = PROD_URL;

for (const cle of CLES) {
  const valeur = local[cle];
  if (!valeur) {
    console.log(`skip ${cle} (vide en local)`);
    continue;
  }
  try {
    execFileSync(
      "vercel",
      ["env", "add", cle, "production", "--force", "--yes", "--sensitive"],
      { input: valeur, stdio: ["pipe", "pipe", "pipe"] }
    );
    console.log(`ok ${cle}`);
  } catch (erreur) {
    const msg = erreur.stderr?.toString() || erreur.message;
    console.error(`échec ${cle}:`, msg.trim());
    process.exitCode = 1;
  }
}
