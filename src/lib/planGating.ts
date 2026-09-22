export type PlanId = "starter" | "pro" | "equipe";

export const LIMITE_DISTRIBUTEURS_STARTER = 3;

const STATUTS_ACCES_ACTIF = new Set(["active", "trialing"]);

export function planEffectif(plan: string | null | undefined): PlanId {
  if (plan === "pro" || plan === "equipe") return plan;
  return "starter";
}

export function abonnementActif(subscriptionStatus: string | null | undefined): boolean {
  return STATUTS_ACCES_ACTIF.has(subscriptionStatus ?? "");
}

/** Export comptable CSV/XLSX — réservé Pro et Équipe (essai inclus). */
export function accesExportComptable(plan: string | null, subscriptionStatus: string | null): boolean {
  if (!abonnementActif(subscriptionStatus)) {
    // Pendant l'essai gratuit (pas encore payé), on laisse tester l'export.
    return subscriptionStatus !== "past_due" && subscriptionStatus !== "unpaid";
  }
  return planEffectif(plan) !== "starter";
}

/** PDF devis client avec logo/SIRET — réservé Pro et Équipe une fois abonné. */
export function accesDevisClientPdf(plan: string | null, subscriptionStatus: string | null): boolean {
  if (!abonnementActif(subscriptionStatus)) return true;
  return planEffectif(plan) !== "starter";
}

/** Nombre max de distributeurs suivés en parallèle (plan Starter). */
export function limiteDistributeurs(plan: string | null, subscriptionStatus: string | null): number | null {
  if (!abonnementActif(subscriptionStatus)) return null;
  if (planEffectif(plan) === "starter") return LIMITE_DISTRIBUTEURS_STARTER;
  return null;
}

/** Profondeur d'historique de prix pour les comparaisons — 12 mois au Starter payant, illimité sinon. */
export function profondeurHistoriqueMois(
  plan: string | null,
  subscriptionStatus: string | null,
): number | null {
  if (!abonnementActif(subscriptionStatus)) return null;
  if (planEffectif(plan) === "starter") return 12;
  return null;
}

export function dateMinHistoriquePlan(
  plan: string | null,
  subscriptionStatus: string | null,
  reference = new Date(),
): Date | null {
  const mois = profondeurHistoriqueMois(plan, subscriptionStatus);
  if (mois === null) return null;
  const limite = new Date(reference);
  limite.setMonth(limite.getMonth() - mois);
  return limite;
}

export function estPlanStarterPayant(plan: string | null, subscriptionStatus: string | null): boolean {
  return abonnementActif(subscriptionStatus) && planEffectif(plan) === "starter";
}

export function messageFonctionPlanRequise(fonction: "export" | "devis_pdf" | "distributeurs"): string {
  if (fonction === "export") {
    return "L'export comptable est inclus dans le plan Pro. Passez à Pro depuis vos paramètres d'abonnement.";
  }
  if (fonction === "devis_pdf") {
    return "Les devis clients PDF (logo + SIRET) sont inclus dans le plan Pro.";
  }
  return `Le plan Starter permet de suivre ${LIMITE_DISTRIBUTEURS_STARTER} distributeurs. Passez à Pro pour tous les comparer.`;
}
