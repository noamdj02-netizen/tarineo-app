const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export const PAGE_ENTITY_TYPES = [
  "chantier",
  "document",
  "devis",
  "commande",
  "facture",
  "fournisseur",
  "relance",
  "dashboard",
] as const;

export type PageEntityType = (typeof PAGE_ENTITY_TYPES)[number];

export type PageContext = {
  route: string;
  entityType?: PageEntityType;
  entityId?: string;
};

export type AssistantContext = {
  userId: string;
  page?: PageContext;
};

export function parsePageContext(raw: unknown, fallbackRoute = ""): PageContext | null {
  if (raw && typeof raw === "object" && !Array.isArray(raw)) {
    const o = raw as Record<string, unknown>;
    const route = typeof o.route === "string" ? o.route.slice(0, 160) : fallbackRoute.slice(0, 160);
    if (!route.startsWith("/")) return fallbackRoute.startsWith("/") ? { route: fallbackRoute.slice(0, 160) } : null;
    const entityType =
      typeof o.entityType === "string" && (PAGE_ENTITY_TYPES as readonly string[]).includes(o.entityType)
        ? (o.entityType as PageEntityType)
        : undefined;
    const entityId = typeof o.entityId === "string" && UUID.test(o.entityId) ? o.entityId : undefined;
    return { route, entityType, entityId };
  }
  if (typeof raw === "string" && raw.startsWith("/")) return { route: raw.slice(0, 160) };
  if (fallbackRoute.startsWith("/")) return { route: fallbackRoute.slice(0, 160) };
  return null;
}

export function inferEntityType(route: string): PageEntityType | undefined {
  if (route === "/accueil" || route === "/") return "dashboard";
  if (/^\/chantiers\/[^/]+/.test(route)) return "chantier";
  if (route.startsWith("/client/devis")) return "devis";
  if (route.startsWith("/client/bon-commande")) return "commande";
  if (route.startsWith("/client/facture")) return "facture";
  if (route.startsWith("/relances")) return "relance";
  if (route.startsWith("/fournisseurs") || route.startsWith("/distributeur")) return "fournisseur";
  if (route.startsWith("/pieces/")) return "document";
  return undefined;
}
