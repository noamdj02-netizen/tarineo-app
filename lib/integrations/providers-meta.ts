import type { IntegrationId } from "@/lib/settings/integrations-catalog";

/** Métadonnées produit (slug, méthode, backend réel). */
export type IntegrationProviderMeta = {
  slug: IntegrationId;
  provider: string;
  connectionMethod: "platform" | "oauth" | "api_keys" | "ical" | "billing_status" | "none" | "manual";
  oauthScopes?: string[];
  healthTest: boolean;
  backendReady: boolean;
  availableFeatures: string[];
};

export const INTEGRATION_PROVIDER_META: Record<IntegrationId, IntegrationProviderMeta> = {
  tarineo_email: {
    slug: "tarineo_email",
    provider: "resend",
    connectionMethod: "platform",
    healthTest: true,
    backendReady: true,
    availableFeatures: ["Relances devis", "E-mails transactionnels", "Exports CSV par e-mail"],
  },
  google: {
    slug: "google",
    provider: "google",
    connectionMethod: "oauth",
    oauthScopes: ["gmail.send", "drive.file (optionnel)", "profile", "email"],
    healthTest: true,
    backendReady: true,
    availableFeatures: ["Bind compte Gmail", "Test profil Gmail — envoi métier via Resend"],
  },
  microsoft: {
    slug: "microsoft",
    provider: "microsoft",
    connectionMethod: "none",
    healthTest: false,
    backendReady: false,
    availableFeatures: [],
  },
  calendar_ical: {
    slug: "calendar_ical",
    provider: "ical",
    connectionMethod: "ical",
    healthTest: true,
    backendReady: true,
    availableFeatures: ["Lecture agenda accueil (14 jours)"],
  },
  stripe_billing: {
    slug: "stripe_billing",
    provider: "stripe",
    connectionMethod: "billing_status",
    healthTest: true,
    backendReady: true,
    availableFeatures: ["Abonnement TARINEO", "Portail client Stripe"],
  },
  pennylane: {
    slug: "pennylane",
    provider: "pennylane",
    connectionMethod: "none",
    healthTest: false,
    backendReady: false,
    availableFeatures: ["Export CSV manuel / e-mail"],
  },
  sellsy: {
    slug: "sellsy",
    provider: "sellsy",
    connectionMethod: "none",
    healthTest: false,
    backendReady: false,
    availableFeatures: ["Export CSV manuel / e-mail"],
  },
  sage: {
    slug: "sage",
    provider: "sage",
    connectionMethod: "none",
    healthTest: false,
    backendReady: false,
    availableFeatures: [],
  },
  ebp: {
    slug: "ebp",
    provider: "ebp",
    connectionMethod: "none",
    healthTest: false,
    backendReady: false,
    availableFeatures: [],
  },
  quickbooks: {
    slug: "quickbooks",
    provider: "quickbooks",
    connectionMethod: "none",
    healthTest: false,
    backendReady: false,
    availableFeatures: [],
  },
  cedeo: {
    slug: "cedeo",
    provider: "cedeo",
    connectionMethod: "manual",
    healthTest: false,
    backendReady: true,
    availableFeatures: ["Import PDF devis"],
  },
  pointp: {
    slug: "pointp",
    provider: "pointp",
    connectionMethod: "manual",
    healthTest: false,
    backendReady: true,
    availableFeatures: ["Import PDF devis"],
  },
  rexel: {
    slug: "rexel",
    provider: "rexel",
    connectionMethod: "manual",
    healthTest: false,
    backendReady: true,
    availableFeatures: ["Import PDF devis"],
  },
  sonepar: {
    slug: "sonepar",
    provider: "sonepar",
    connectionMethod: "manual",
    healthTest: false,
    backendReady: true,
    availableFeatures: ["Import PDF devis"],
  },
  api_tarineo: {
    slug: "api_tarineo",
    provider: "tarineo_mcp",
    connectionMethod: "api_keys",
    healthTest: true,
    backendReady: true,
    availableFeatures: ["Route /api/mcp", "Clés hashées"],
  },
};
