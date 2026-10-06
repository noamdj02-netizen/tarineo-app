import type { DocDirection, DocKind, PartyKind } from "@/lib/metier/types";

/** Types exposés aux intégrations (n8n, MCP). Mapping vers le modèle TARINEO interne. */
export const INTEGRATION_DOCUMENT_KINDS = [
  "supplier_quote",
  "supplier_invoice",
  "supplier_purchase_order",
  "supplier_delivery_note",
  "customer_quote",
  "customer_invoice",
  "customer_purchase_order",
] as const;

export type IntegrationDocumentKind = (typeof INTEGRATION_DOCUMENT_KINDS)[number];

export type IntegrationKindMapping = {
  direction: DocDirection;
  kind: DocKind;
  defaultPartyKind: PartyKind;
  integrationKind: IntegrationDocumentKind;
};

const MAP: Record<IntegrationDocumentKind, Omit<IntegrationKindMapping, "integrationKind">> = {
  supplier_quote: { direction: "in", kind: "devis", defaultPartyKind: "fournisseur" },
  supplier_invoice: { direction: "in", kind: "facture", defaultPartyKind: "fournisseur" },
  supplier_purchase_order: { direction: "in", kind: "bon_commande", defaultPartyKind: "fournisseur" },
  supplier_delivery_note: { direction: "in", kind: "bl", defaultPartyKind: "fournisseur" },
  customer_quote: { direction: "out", kind: "devis", defaultPartyKind: "client" },
  customer_invoice: { direction: "out", kind: "facture", defaultPartyKind: "client" },
  customer_purchase_order: { direction: "out", kind: "bon_commande", defaultPartyKind: "client" },
};

export function parseIntegrationDocumentKind(raw: string): IntegrationDocumentKind | null {
  const key = raw.trim() as IntegrationDocumentKind;
  return INTEGRATION_DOCUMENT_KINDS.includes(key) ? key : null;
}

export function resolveIntegrationKind(
  integrationKind: IntegrationDocumentKind,
): IntegrationKindMapping {
  const base = MAP[integrationKind];
  return { ...base, integrationKind };
}

/** Déduit un type intégration à partir de l’extraction IA (fallback). */
export function integrationKindFromExtract(direction: DocDirection, kind: DocKind): IntegrationDocumentKind {
  if (direction === "in") {
    if (kind === "facture") return "supplier_invoice";
    if (kind === "bon_commande") return "supplier_purchase_order";
    if (kind === "bl") return "supplier_delivery_note";
    return "supplier_quote";
  }
  if (kind === "facture") return "customer_invoice";
  if (kind === "bon_commande") return "customer_purchase_order";
  return "customer_quote";
}
