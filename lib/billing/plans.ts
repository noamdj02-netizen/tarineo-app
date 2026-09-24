/**
 * Plans et prix de Navpit : le seul fichier à modifier pour changer une offre.
 * Pro suit un prix fidélité : il baisse à chaque année d'abonnement sans interruption.
 */

export type PlanId = "free" | "pro" | "founder";
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
  pro: { projects: null, aiPerMonth: 500, schemas: null, calendarSync: true },
  founder: { projects: null, aiPerMonth: 500, schemas: null, calendarSync: true },
};

/** Paliers de fidélité, par année d'ancienneté (le dernier s'applique ensuite pour toujours). */
export const LOYALTY_TIERS = [
  { fromYear: 1, month: 15, year: 150, label: "1re année" },
  { fromYear: 2, month: 12, year: 120, label: "2e année" },
  { fromYear: 3, month: 9, year: 90, label: "Dès la 3e année" },
] as const;

export type TierIndex = 0 | 1 | 2;

export const FOUNDER = { price: 149, seats: 100 } as const;

/** Palier à appliquer selon la date de début de l'abonnement en cours. */
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
  pro: [
    "Projets illimités",
    "500 questions au copilote IA par mois",
    "Schémas illimités",
    "Agenda Google ou Apple dans le planning",
    "Prix qui baisse chaque année",
  ],
  founder: [
    "Tout Pro, à vie",
    "Un seul paiement",
    `Réservé aux ${FOUNDER.seats} premiers`,
  ],
};
