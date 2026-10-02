import type { DocKind, DocDirection, ExtractResult, PartyKind } from "@/lib/metier/types";
import type { StructuralHintDelta } from "@/lib/metier/document-agent/types";

export function structuralDiff(
  raw: ExtractResult | null | undefined,
  confirmed: {
    kind: DocKind;
    direction: DocDirection;
    partyKind: PartyKind;
    totals?: { ht?: number | null };
    lines: { label: string }[];
  },
): StructuralHintDelta {
  if (!raw) return {};
  const delta: StructuralHintDelta = {};
  if (raw.kind !== confirmed.kind) delta.kind_corrected = true;
  if (raw.direction !== confirmed.direction) delta.direction_corrected = true;
  if (raw.party_kind !== confirmed.partyKind) delta.party_kind_corrected = true;
  const lineDelta = confirmed.lines.length - raw.lines.length;
  if (lineDelta !== 0) delta.line_count_delta = lineDelta;
  const rawHt = raw.totals?.ht;
  const confHt = confirmed.totals?.ht ?? null;
  if (rawHt != null && confHt != null && Math.abs(rawHt - confHt) > 0.02) {
    delta.totals_ht_mismatch = true;
  }
  return delta;
}
