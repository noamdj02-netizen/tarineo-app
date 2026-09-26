/**
 * Plans et prix de Navpit : le seul fichier à modifier pour changer une offre.
 */

export type PlanId = "free" | "starter" | "pro" | "founder";
export type Interval = "month" | "year";

export type Limits = {
  /** null = illimité */
  projects: number | null;
  aiPerMonth: number;
  schemas: number | null;
  calendarSync: boolean;
};

export const LIMITS: Record<PlanId, Limits> = {
  free: { projects: 2, aiPerMonth: 30, schemas: 3, calendarSync: false },
  starter: { projects: 6, aiPerMonth: 300, schemas: 100, calendarSync: false },
  pro: { projects: null, aiPerMonth: 500, schemas: null, calendarSync: true },
  founder: { projects: null, aiPerMonth: 500, schemas: null, calendarSync: true },
};

/** Formule Création (entrée de gamme). */
export const STARTER = { month: 15, year: 150 } as const;

/** Formule Pro (complète). */
export const PRO = { month: 30, year: 300 } as const;

export const FOUNDER = { price: 149, seats: 100 } as const;

/** Essai Pro sans carte bancaire (durée alignée sur la migration SQL). */
export const PRO_TRIAL_DAYS = 14;

/**
 * Prix Création / Pro selon l’ancienneté (anniversaire de facturation).
 * Index 0 = 1re année, 1 = 2e année, 2 = 3e année et suivantes.
 */
export const SUBSCRIPTION_LOYALTY = {
  starter: {
    labels: ["1re année", "2e année", "Dès la 3e année"] as const,
    month: [STARTER.month, 12, 9] as const,
    year: [STARTER.year, 120, 90] as const,
  },
  pro: {
    labels: ["1re année", "2e année", "Dès la 3e année"] as const,
    month: [PRO.month, 24, 18] as const,
    year: [PRO.year, 240, 180] as const,
  },
} as const;

/** @deprecated Alias historique — utiliser SUBSCRIPTION_LOYALTY.starter */
export const LOYALTY_TIERS = SUBSCRIPTION_LOYALTY.starter.labels.map((label, i) => ({
  fromYear: i + 1,
  month: SUBSCRIPTION_LOYALTY.starter.month[i],
  year: SUBSCRIPTION_LOYALTY.starter.year[i],
  label,
}));

export type TierIndex = 0 | 1 | 2;

/** Palier à appliquer selon la date de début de l'abonnement en cours (legacy). */
export function tierFor(startedAt: Date, now = new Date()): TierIndex {
  const months =
    (now.getUTCFullYear() - startedAt.getUTCFullYear()) * 12 +
    (now.getUTCMonth() - startedAt.getUTCMonth()) -
    (now.getUTCDate() < startedAt.getUTCDate() ? 1 : 0);
  if (months >= 24) return 2;
  if (months >= 12) return 1;
  return 0;
}

export const PLAN_LABEL: Record<PlanId, string> = {
  free: "Gratuit",
  starter: "Création",
  pro: "Pro",
  founder: "Fondateur",
};

export const FEATURES: Record<PlanId, string[]> = {
  free: [
    "2 projets",
    "30 questions au copilote IA par mois",
    "3 schémas",
    "Ressources, composants, thèmes, anatomie",
  ],
  starter: [
    `${PRO_TRIAL_DAYS} jours d’essai Pro gratuit, sans carte`,
    "Prix qui baisse chaque année d’abonnement (jusqu’à 9 €/mois)",
    "Jusqu’à 6 projets",
    "300 questions au copilote IA par mois",
    "Jusqu’à 100 schémas",
    "Ressources, composants, thèmes, anatomie landing",
    "Liens et docs par projet",
  ],
  pro: [
    "Prix qui baisse chaque année d’abonnement (jusqu’à 18 €/mois)",
    "Tout Création, sans plafond projet / schéma",
    "Projets illimités",
    "500 questions au copilote IA par mois",
    "Schémas illimités sur la toile",
    "Agenda Google ou Apple dans le planning",
    "Copilote avec le contexte de tes projets",
  ],
  founder: [
    "Tout Pro, à vie — un seul paiement",
    `${FOUNDER.price} € une fois, sans abonnement`,
    `Réservé aux ${FOUNDER.seats} premiers soutiens`,
    "Projets illimités",
    "500 questions au copilote IA par mois",
    "Schémas illimités",
    "Agenda Google ou Apple synchronisé",
    "Un projet en Focus jusqu’à la première vente",
    "Composants, palettes et typos prêts à copier",
    "Anatomie des 12 frames d’une landing",
    "Bibliothèque ressources design",
    "Support prioritaire par email",
  ],
};
