import type { IntegrationDocumentKind } from "@/lib/integrations/document-kind";
import type { DocumentCard } from "@/lib/metier/types";

export type IngestDocumentResponse = {
  document_id: string;
  type: IntegrationDocumentKind;
  direction: "in" | "out";
  kind: string;
  title: string;
  supplier: { name: string } | null;
  customer: { name: string } | null;
  chantier_id: string | null;
  lines: Array<{
    description: string;
    quantity: number;
    unit: string;
    unit_price_ht: number;
    sell_price_ht?: number;
    vat_rate?: number | null;
  }>;
  totals: {
    total_ht: number | null;
    total_tva: number | null;
    total_ttc: number | null;
  };
  extraction: {
    quality?: string;
    vendor_key?: string | null;
  };
};

export function documentToIngestResponse(
  doc: DocumentCard,
  integrationType: IntegrationDocumentKind,
): IngestDocumentResponse {
  const extract = doc.extract ?? {};
  const totalsRaw = (extract.totals ?? extract) as Record<string, unknown>;
  const num = (v: unknown) => {
    const n = Number(v);
    return Number.isFinite(n) ? n : null;
  };
  const isSupplier = doc.direction === "in";
  const partyName = doc.party_name?.trim() || "Inconnu";
  return {
    document_id: doc.id,
    type: integrationType,
    direction: doc.direction,
    kind: doc.kind,
    title: doc.title,
    supplier: isSupplier ? { name: partyName } : null,
    customer: !isSupplier ? { name: partyName } : null,
    chantier_id: doc.chantier_id,
    lines: doc.lines.map((l) => ({
      description: l.label,
      quantity: l.qty,
      unit: l.unit,
      unit_price_ht: l.buy_price,
      sell_price_ht: doc.direction === "out" ? l.sell_price : undefined,
      vat_rate: null,
    })),
    totals: {
      total_ht: num(totalsRaw.ht ?? totalsRaw.total_ht),
      total_tva: num(totalsRaw.tva ?? totalsRaw.total_tva),
      total_ttc: num(totalsRaw.ttc ?? totalsRaw.total_ttc),
    },
    extraction: {
      quality: typeof extract.read_recap === "object" ? undefined : undefined,
      vendor_key: typeof extract.vendor_key === "string" ? extract.vendor_key : null,
    },
  };
}
