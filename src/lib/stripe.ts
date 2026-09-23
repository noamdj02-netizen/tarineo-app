import Stripe from "stripe";
import { validerConfigStripeLive } from "@/lib/stripeConfig";

// Client Stripe serveur unique (clé secrète, jamais exposée côté navigateur) — voir
// src/app/(app)/documents/stripeActions.ts pour la création du SetupIntent et
// src/app/api/stripe/webhook/route.ts pour la confirmation asynchrone.
// Pas de apiVersion explicite : on reste sur celle intégrée au SDK installé.
//
// Instancié à la première utilisation réelle (via Proxy), pas à l'import du module :
// le SDK Stripe rejette une clé vide dès son constructeur, or `next build` importe
// chaque route (dont /api/stripe/webhook) pour en extraire les métadonnées — une
// instanciation directe ferait donc échouer tout le build si STRIPE_SECRET_KEY
// n'est momentanément pas configurée, plutôt que de ne bloquer que les appels Stripe.
let instance: Stripe | null = null;

function obtenirClientStripe(): Stripe {
  if (!instance) {
    validerConfigStripeLive();
    instance = new Stripe(process.env.STRIPE_SECRET_KEY ?? "");
  }
  return instance;
}

export const stripe = new Proxy({} as Stripe, {
  get(_cible, propriete, recepteur) {
    return Reflect.get(obtenirClientStripe(), propriete, recepteur);
  },
});

// Price Stripe mensuels : c'est ce que le webhook (setup_intent.succeeded) utilise
// pour créer un véritable abonnement à l'ajout d'une carte — voir .env.example.
export const PRIX_MENSUEL_PAR_PLAN: Record<string, string | undefined> = {
  starter: process.env.STRIPE_PRICE_STARTER,
  pro: process.env.STRIPE_PRICE_PRO,
  equipe: process.env.STRIPE_PRICE_PREMIUM,
};

// Price Stripe annuels : aucun parcours utilisateur réel ne les utilise pour
// l'instant (pas de sélection annuelle sur l'écran d'ajout de carte) — présents
// uniquement pour créer des abonnements de test lors de la vérification de la
// résiliation/désactivation de renouvellement d'un abonnement annuel.
export const PRIX_ANNUEL_PAR_PLAN: Record<string, string | undefined> = {
  starter: process.env.STRIPE_PRICE_STARTER_ANNUEL,
  pro: process.env.STRIPE_PRICE_PRO_ANNUEL,
  equipe: process.env.STRIPE_PRICE_PREMIUM_ANNUEL,
};

const TOUS_LES_PRIX_PAR_PLAN: Record<string, string | undefined> = {
  ...PRIX_MENSUEL_PAR_PLAN,
  ...PRIX_ANNUEL_PAR_PLAN,
};

/** Retrouve la clé plan (`starter` | `pro` | `equipe`) à partir d'un price Stripe. */
export function planDepuisPriceId(priceId: string | null | undefined): string | null {
  if (!priceId) return null;
  for (const [plan, id] of Object.entries(TOUS_LES_PRIX_PAR_PLAN)) {
    if (id === priceId) return plan;
  }
  return null;
}

export function priceIdValide(priceId: string): boolean {
  return Object.values(TOUS_LES_PRIX_PAR_PLAN).includes(priceId);
}
