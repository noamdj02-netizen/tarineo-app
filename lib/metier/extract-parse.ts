import type { ExtractResult, ExtractTotals } from "@/lib/metier/types";

export class ExtractError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ExtractError";
  }
}

function numOrNull(v: unknown): number | null {
  if (v == null || v === "") return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

function parseTotals(raw: unknown, lineSum: number): ExtractTotals {
  const t = (raw && typeof raw === "object" ? raw : {}) as Record<string, unknown>;
  return {
    ht: numOrNull(t.ht ?? t.total_ht) ?? (lineSum > 0 ? Math.round(lineSum * 100) / 100 : null),
    eco_contribution: numOrNull(t.eco_contribution ?? t.eco),
    pmcb: numOrNull(t.pmcb),
    weight_kg: numOrNull(t.weight_kg ?? t.poids),
  };
}

const KINDS = new Set(["devis", "facture", "bon_commande", "bl", "bon_enlevement", "autre"]);

/** Parse la réponse modèle. Aucune donnée métier inventée. */
export function parseExtractResponse(raw: string, fileName: string): ExtractResult {
  const json = raw.match(/\{[\s\S]*\}/)?.[0];
  if (!json) {
    throw new ExtractError("Extraction impossible : la réponse n’est pas lisible. Réessayez avec un PDF plus net.");
  }
  let parsed: ExtractResult & { totals?: ExtractTotals };
  try {
    parsed = JSON.parse(json) as ExtractResult & { totals?: ExtractTotals };
  } catch {
    throw new ExtractError("Extraction impossible : JSON invalide.");
  }
  if (!parsed.kind || !KINDS.has(String(parsed.kind)) || !Array.isArray(parsed.lines) || parsed.lines.length === 0) {
    throw new ExtractError("Extraction impossible : le document n’a pas pu être lu. Vérifiez le fichier.");
  }
  const lines = parsed.lines.map((l) => ({
    label: String(l.label ?? "").trim() || "Ligne",
    qty: Number(l.qty) || 1,
    unit: l.unit || "u",
    buy_price: Number(l.buy_price) || 0,
    eco_contribution: numOrNull(l.eco_contribution),
    pmcb: numOrNull(l.pmcb),
    weight_kg: numOrNull(l.weight_kg),
  }));
  const lineSum = lines.reduce((s, l) => s + l.buy_price * l.qty, 0);
  return {
    direction: parsed.direction === "out" ? "out" : "in",
    kind: parsed.kind,
    title: parsed.title || fileName,
    party_name: parsed.party_name || "Inconnu",
    party_kind: parsed.party_kind || "distributeur",
    chantier_hint: parsed.chantier_hint || "",
    totals: parseTotals(parsed.totals, lineSum),
    lines,
  };
}
