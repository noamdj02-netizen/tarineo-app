function lireFlag(nom: string): boolean {
  return process.env[nom] === "true";
}

/** Feature flags V1 — false par défaut (variable absente ou ≠ "true"). */
export const features = {
  clientBilling: lireFlag("FEATURE_CLIENT_BILLING"),
  projects: lireFlag("FEATURE_PROJECTS"),
  expenses: lireFlag("FEATURE_EXPENSES"),
  purchaseOrders: lireFlag("FEATURE_PURCHASE_ORDERS"),
  vault: lireFlag("FEATURE_VAULT"),
} as const;
