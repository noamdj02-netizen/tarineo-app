import { suggestChantierFromHint } from "@/lib/metier/chantier-match";
import type { ChantierCard, DocDirection, DocKind, ExtractResult } from "@/lib/metier/types";

export function confirmPayloadFromExtract(
  extracted: ExtractResult,
  files: { filePath?: string; fileSha256?: string },
  chantiers: ChantierCard[],
  opts?: {
    lockKind?: DocKind;
    lockDirection?: DocDirection;
    defaultChantierId?: string | null;
  },
) {
  const direction = opts?.lockDirection ?? extracted.direction;
  const kind = opts?.lockKind ?? extracted.kind;
  const suggested = suggestChantierFromHint(
    [extracted.chantier_hint, extracted.title].filter(Boolean).join(" "),
    chantiers,
  );
  const chantierId = suggested?.id ?? opts?.defaultChantierId ?? null;

  return {
    title: extracted.title,
    direction,
    kind,
    partyName: extracted.party_name,
    partyKind: extracted.party_kind,
    chantierId,
    filePath: files.filePath,
    fileSha256: files.fileSha256,
    documentNumber: extracted.document_number ?? null,
    issueDate: extracted.issue_date ?? null,
    deliveryDate: extracted.delivery_date ?? null,
    partyAddress: extracted.party_address ?? null,
    contactName: extracted.contact_name ?? null,
    contactEmail: extracted.contact_email ?? null,
    contactPhone: extracted.contact_phone ?? null,
    totals: extracted.totals ?? undefined,
    lines: extracted.lines.map((l) => {
      const price = l.buy_price ?? l.sell_price ?? 0;
      return {
        label: l.label,
        qty: l.qty,
        unit: l.unit,
        buy_price: direction === "in" ? price : 0,
        sell_price: direction === "out" ? price : (l.sell_price ?? 0),
        eco_contribution: l.eco_contribution,
        pmcb: l.pmcb,
        weight_kg: l.weight_kg,
      };
    }),
  };
}
