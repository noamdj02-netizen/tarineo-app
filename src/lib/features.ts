function lireFlag(nom: string): boolean {
  return process.env[nom] === "true";
}

/** Feature flags V1 — false par défaut (variable absente ou ≠ "true"). */
export const features = {
  /** devis-clients, factures-clients, facturation-clients, clients */
  clientBilling: lireFlag("FEATURE_CLIENT_BILLING"),
  /** chantiers */
  projects: lireFlag("FEATURE_PROJECTS"),
  /** depenses, depenses/export */
  expenses: lireFlag("FEATURE_EXPENSES"),
  /** bons-de-commande, bons-enlevement */
  purchaseOrders: lireFlag("FEATURE_PURCHASE_ORDERS"),
  /** coffre */
  vault: lireFlag("FEATURE_VAULT"),
} as const;
