import type { DevisDraft, DevisSource } from "@/lib/metier/devis/types";
import { normalizeDevisLine } from "@/lib/metier/devis/validate";

/** Proposition vocale / IA avant confirmation (peut contenir des prix null). */
export type DevisProposalLine = {
  label: string;
  qty: number | null;
  unit: string | null;
  unitPrice: number | null;
  vatRate: number | null;
  note: string | null;
  missing: string[];
};

export type DevisProposal = {
  summary: string;
  clientQuery: string | null;
  lines: DevisProposalLine[];
  questions: string[];
  warnings: string[];
  defaultVatRate: number;
};

/** Convertit une proposition revue en DevisDraft pour persistence. */
export function draftFromProposal(
  proposal: DevisProposal,
  opts: {
    source?: DevisSource;
    clientName?: string | null;
    clientId?: string | null;
    chantierId?: string | null;
    chantierName?: string | null;
    idempotencyKey?: string;
  } = {},
): DevisDraft {
  const vatDefault = proposal.defaultVatRate > 0 ? proposal.defaultVatRate : 20;
  return {
    client: {
      id: opts.clientId ?? null,
      name: opts.clientName?.trim() || proposal.clientQuery?.trim() || "Client",
      query: proposal.clientQuery,
    },
    chantier: opts.chantierId || opts.chantierName
      ? { id: opts.chantierId ?? null, name: opts.chantierName ?? null }
      : undefined,
    lines: proposal.lines.map((l) =>
      normalizeDevisLine(
        {
          label: l.label,
          qty: l.qty,
          unit: l.unit,
          unitPrice: l.unitPrice,
          vatRate: l.vatRate ?? vatDefault,
          missing: l.missing,
          note: l.note,
        },
        vatDefault,
      ),
    ),
    source: opts.source ?? "voice",
    title: proposal.summary?.slice(0, 80) || "Devis",
    vatMode: vatDefault === 0 ? "exempt" : "standard",
    validityDays: 30,
    idempotencyKey: opts.idempotencyKey,
    questions: proposal.questions,
    warnings: proposal.warnings,
  };
}
