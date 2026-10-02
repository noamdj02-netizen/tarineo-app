import type { DocumentCard } from "@/lib/metier/types";

export type ExportRow = Record<string, string | number>;

export function buildExportRows(docs: DocumentCard[]): ExportRow[] {
  return docs.map((d) => ({
    Date: d.created_at.slice(0, 10),
    Type: d.kind,
    Titre: d.title,
    Partie: d.party_name ?? "",
    HT: Math.round(
      d.lines.reduce((s, l) => s + Number(l.buy_price || l.sell_price) * Number(l.qty), 0) * 100,
    ) / 100,
  }));
}

export function buildExportPreviewRows(docs: DocumentCard[], limit = 20): ExportRow[] {
  return buildExportRows(docs.slice(0, limit));
}
