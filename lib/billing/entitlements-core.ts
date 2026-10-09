import type { PlanInfo } from "@/lib/billing/plan";

/** Fonctionnalités contrôlées par plan (Starter vs Pro). */
export type TarineoFeature =
  | "documents_core"
  | "quote_followup_manual"
  | "quote_followup_auto"
  | "margin_alert"
  | "accounting_export_auto"
  | "calendar_sync"
  | "api_access"
  | "mcp_business"
  | "advanced_integrations";

const PRO_ONLY = new Set<TarineoFeature>([
  "quote_followup_auto",
  "accounting_export_auto",
  "calendar_sync",
  "api_access",
  "mcp_business",
  "advanced_integrations",
]);

/** Pro effectif : abonnement Pro, Fondateur, ou essai Pro 7 j. */
export function hasProEntitlements(plan: PlanInfo): boolean {
  return plan.plan === "pro" || plan.plan === "founder" || plan.isFreeTrial;
}

export function canUseFeature(plan: PlanInfo | null, feature: TarineoFeature): boolean {
  if (!plan) return false;
  if (plan.status === "owner") return true;
  if (!PRO_ONLY.has(feature)) return true;
  return hasProEntitlements(plan);
}

export function featureDeniedMessage(feature: TarineoFeature): string {
  switch (feature) {
    case "quote_followup_auto":
      return "Les relances automatiques sont incluses dans le plan Pro. Passez à Pro depuis Abonnement.";
    case "accounting_export_auto":
      return "L’export comptable automatique est réservé au plan Pro.";
    case "calendar_sync":
      return "La synchronisation d’agenda est incluse dans le plan Pro.";
    case "api_access":
      return "Les clés API et l’accès MCP sont réservés au plan Pro.";
    case "mcp_business":
      return "L’import document et les outils métier MCP sont réservés au plan Pro.";
    case "advanced_integrations":
      return "Cette intégration avancée est réservée au plan Pro.";
    default:
      return "Cette fonctionnalité est réservée au plan Pro.";
  }
}

export function getEntitlements(plan: PlanInfo | null): Record<TarineoFeature, boolean> {
  const features: TarineoFeature[] = [
    "documents_core",
    "quote_followup_manual",
    "quote_followup_auto",
    "margin_alert",
    "accounting_export_auto",
    "calendar_sync",
    "api_access",
    "mcp_business",
    "advanced_integrations",
  ];
  return Object.fromEntries(features.map((f) => [f, canUseFeature(plan, f)])) as Record<
    TarineoFeature,
    boolean
  >;
}
