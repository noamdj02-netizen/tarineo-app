const NOMS_VARS_PRIX = [
  "STRIPE_PRICE_STARTER",
  "STRIPE_PRICE_PRO",
  "STRIPE_PRICE_PREMIUM",
  "STRIPE_PRICE_STARTER_ANNUEL",
  "STRIPE_PRICE_PRO_ANNUEL",
  "STRIPE_PRICE_PREMIUM_ANNUEL",
] as const;

export const MESSAGE_ABONNEMENT_INDISPONIBLE =
  "L'abonnement n'est pas disponible pour le moment. Réessayez plus tard ou contactez le support.";

export function estCleStripeLive(): boolean {
  return (process.env.STRIPE_SECRET_KEY ?? "").startsWith("sk_live_");
}

export function estCleStripeTest(): boolean {
  return (process.env.STRIPE_SECRET_KEY ?? "").startsWith("sk_test_");
}

export type ResultatValidationStripe =
  | { ok: true }
  | { ok: false; manquants: string[]; message: string };

let dejaLoggue = false;

/** Vérifie que les price IDs live sont configurés quand la clé secrète est en mode live. */
export function validerConfigStripeLive(): ResultatValidationStripe {
  if (!estCleStripeLive()) return { ok: true };

  const manquants = NOMS_VARS_PRIX.filter((varName) => !process.env[varName]?.trim());

  if (manquants.length === 0) return { ok: true };

  const message = `[Tarineo Stripe] Clé live (sk_live_) mais price IDs manquants : ${manquants.join(", ")}. Créez les produits/prix en mode live dans Stripe Dashboard et renseignez les variables sur Vercel.`;

  if (!dejaLoggue) {
    console.error(message);
    dejaLoggue = true;
  }

  return { ok: false, manquants: [...manquants], message };
}

/** Bloque un checkout si la config live est incomplète — message utilisateur en français. */
export function erreurCheckoutSiConfigIncomplete(): string | null {
  const validation = validerConfigStripeLive();
  if (validation.ok) return null;
  return MESSAGE_ABONNEMENT_INDISPONIBLE;
}
