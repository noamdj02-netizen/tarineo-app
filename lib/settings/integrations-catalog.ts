/**
 * Catalogue d’intégrations TARINEO — états factuels uniquement.
 * Ne jamais marquer `connected` sans preuve (tool_connections / api_keys / feed).
 */

export type IntegrationStatus =
  | "connected"
  | "available"
  | "requires_setup"
  | "coming_soon"
  | "disabled"
  | "error";

export type IntegrationId =
  | "google"
  | "microsoft"
  | "calendar_ical"
  | "pennylane"
  | "sellsy"
  | "sage"
  | "ebp"
  | "quickbooks"
  | "cedeo"
  | "pointp"
  | "rexel"
  | "sonepar"
  | "api_tarineo";

export type IntegrationCategory = "messagerie" | "comptabilite" | "fournisseurs" | "api";

export type IntegrationDef = {
  id: IntegrationId;
  category: IntegrationCategory;
  name: string;
  subtitle: string;
  description: string;
  /** Capacité réelle côté code aujourd’hui */
  capability: "oauth" | "ical" | "api_keys" | "manual_import" | "none";
  permissions?: string[];
};

export const INTEGRATIONS: IntegrationDef[] = [
  {
    id: "google",
    category: "messagerie",
    name: "Google",
    subtitle: "Gmail",
    description: "Autorisez l’envoi d’e-mails via votre compte Google pour les workflows TARINEO.",
    capability: "oauth",
    permissions: ["Gmail (envoi)"],
  },
  {
    id: "microsoft",
    category: "messagerie",
    name: "Microsoft 365",
    subtitle: "Outlook & Calendar",
    description: "Messagerie et agenda Microsoft — OAuth non configuré pour le moment.",
    capability: "none",
  },
  {
    id: "calendar_ical",
    category: "messagerie",
    name: "Agenda (iCal)",
    subtitle: "Google · Apple · Outlook",
    description: "Collez un flux iCal privé pour afficher vos événements sur l’accueil.",
    capability: "ical",
    permissions: ["Lecture du flux iCal"],
  },
  {
    id: "pennylane",
    category: "comptabilite",
    name: "Pennylane",
    subtitle: "Comptabilité",
    description: "Cette intégration nécessite encore une connexion fournisseur.",
    capability: "none",
  },
  {
    id: "sellsy",
    category: "comptabilite",
    name: "Sellsy",
    subtitle: "Comptabilité",
    description: "Cette intégration nécessite encore une connexion fournisseur.",
    capability: "none",
  },
  {
    id: "sage",
    category: "comptabilite",
    name: "Sage",
    subtitle: "Comptabilité",
    description: "Cette intégration nécessite encore une connexion fournisseur.",
    capability: "none",
  },
  {
    id: "ebp",
    category: "comptabilite",
    name: "EBP",
    subtitle: "Comptabilité",
    description: "Cette intégration nécessite encore une connexion fournisseur.",
    capability: "none",
  },
  {
    id: "quickbooks",
    category: "comptabilite",
    name: "QuickBooks",
    subtitle: "Comptabilité",
    description: "Cette intégration nécessite encore une connexion fournisseur.",
    capability: "none",
  },
  {
    id: "cedeo",
    category: "fournisseurs",
    name: "CEDEO",
    subtitle: "Distributeur",
    description: "Import manuel de devis PDF disponible. Connexion API en préparation.",
    capability: "manual_import",
  },
  {
    id: "pointp",
    category: "fournisseurs",
    name: "Point.P",
    subtitle: "Distributeur",
    description: "Import manuel de devis PDF disponible. Connexion API en préparation.",
    capability: "manual_import",
  },
  {
    id: "rexel",
    category: "fournisseurs",
    name: "Rexel",
    subtitle: "Distributeur",
    description: "Import manuel de devis PDF disponible. Connexion API en préparation.",
    capability: "manual_import",
  },
  {
    id: "sonepar",
    category: "fournisseurs",
    name: "Sonepar",
    subtitle: "Distributeur",
    description: "Import manuel de devis PDF disponible. Connexion API en préparation.",
    capability: "manual_import",
  },
  {
    id: "api_tarineo",
    category: "api",
    name: "API TARINEO",
    subtitle: "Clés MCP / HTTP",
    description: "Connectez TARINEO à vos outils internes. La clé secrète n’est affichée qu’une fois.",
    capability: "api_keys",
    permissions: ["read", "write"],
  },
];

export const CATEGORY_LABEL: Record<IntegrationCategory, string> = {
  messagerie: "Messagerie & agenda",
  comptabilite: "Comptabilité",
  fournisseurs: "Fournisseurs",
  api: "API",
};

export type IntegrationRuntime = {
  status: IntegrationStatus;
  accountLabel?: string | null;
  connectedAt?: string | null;
  lastSyncAt?: string | null;
  errorMessage?: string | null;
  waitlisted?: boolean;
};

export type IntegrationSnapshot = IntegrationDef & IntegrationRuntime;

export function isIntegrationId(v: string): v is IntegrationId {
  return INTEGRATIONS.some((i) => i.id === v);
}
