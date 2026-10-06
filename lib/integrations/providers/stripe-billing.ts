import "server-only";
import { getPlan } from "@/lib/billing/plan";
import { isStripeConfigured } from "@/lib/billing/stripe";
import type { ConnectionTestResult } from "../types";

/** Statut abonnement TARINEO (Stripe plateforme) — pas une connexion OAuth artisan. */
export async function testStripeBillingConnection(): Promise<ConnectionTestResult> {
  const checkedAt = new Date().toISOString();
  if (!isStripeConfigured()) {
    return {
      integrationId: "stripe_billing",
      outcome: "misconfigured",
      message: "La facturation TARINEO n’est pas configurée sur cet environnement.",
      checkedAt,
    };
  }
  const plan = await getPlan();
  if (!plan) {
    return {
      integrationId: "stripe_billing",
      outcome: "not_connected",
      message: "Connectez-vous pour voir votre abonnement.",
      checkedAt,
    };
  }
  if (plan.status === "owner" || plan.hasPaidSubscription || plan.isFreeTrial || plan.plan !== "free") {
    const label =
      plan.plan === "founder"
        ? "Compte fondateur"
        : plan.isFreeTrial
          ? "Essai Pro en cours"
          : `Plan ${plan.plan}`;
    return {
      integrationId: "stripe_billing",
      outcome: "ok",
      message: `${label} — facturation Stripe active.`,
      checkedAt,
    };
  }
  return {
    integrationId: "stripe_billing",
    outcome: "not_connected",
    message: "Aucun abonnement actif. Gérez votre offre depuis Abonnement.",
    checkedAt,
  };
}
