import { normalizeSupplierContact } from "@/lib/metier/supplier-contact";
import type { ExtractReadAssessment, ExtractResult, ExtractTotals, ReadQuality } from "@/lib/metier/types";

export class ExtractError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ExtractError";
  }
}

function numOrNull(v: unknown): number | null {
  if (v == null || v === "" || v === "null") return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

function parseTotals(raw: unknown, lineSum: number): ExtractTotals {
  const t = (raw && typeof raw === "object" ? raw : {}) as Record<string, unknown>;
  return {
    ht: numOrNull(t.ht ?? t.total_ht) ?? (lineSum > 0 ? Math.round(lineSum * 100) / 100 : null),
    tva: numOrNull(t.tva ?? t.total_tva),
    ttc: numOrNull(t.ttc ?? t.total_ttc),
    eco_contribution: numOrNull(t.eco_contribution ?? t.eco),
    pmcb: numOrNull(t.pmcb),
    weight_kg: numOrNull(t.weight_kg ?? t.poids),
  };
}

const KINDS = new Set(["devis", "facture", "bon_commande", "bl", "bon_enlevement", "autre"]);
const READ_QUALITIES = new Set<ReadQuality>(["fiable", "partiel", "incertain"]);
const ISO_DAY = /^\d{4}-\d{2}-\d{2}$/;

function parseIsoDay(raw: unknown): string | undefined {
  const s = String(raw ?? "").trim();
  if (!ISO_DAY.test(s)) return undefined;
  const t = Date.parse(`${s}T12:00:00Z`);
  return Number.isFinite(t) ? s : undefined;
}

function parseReadAssessment(raw: unknown): ExtractReadAssessment | undefined {
  const a = (raw && typeof raw === "object" ? raw : null) as Record<string, unknown> | null;
  if (!a) return undefined;
  const quality = String(a.quality ?? "").trim() as ReadQuality;
  if (!READ_QUALITIES.has(quality)) return undefined;
  const summary = String(a.summary ?? "").trim();
  const caveats = Array.isArray(a.caveats)
    ? a.caveats.map((c) => String(c).trim()).filter(Boolean).slice(0, 6)
    : [];
  if (!summary && caveats.length === 0) return undefined;
  return {
    summary: summary.slice(0, 600),
    quality,
    caveats,
  };
}

/** Parse la réponse modèle. Aucune donnée métier inventée. */
export function parseExtractResponse(raw: string, fileName: string): ExtractResult {
  const json = raw.match(/\{[\s\S]*\}/)?.[0];
  if (!json) {
    throw new ExtractError("Extraction impossible : la réponse n’est pas lisible. Réessayez avec un PDF plus net.");
  }
  let parsed: Record<string, unknown>;
  try {
    parsed = JSON.parse(json) as Record<string, unknown>;
  } catch {
    throw new ExtractError("Extraction impossible : JSON invalide.");
  }

  const kind = String(parsed.kind ?? "");
  const rawLines = Array.isArray(parsed.lines) ? parsed.lines : [];
  if (!KINDS.has(kind) || rawLines.length === 0) {
    throw new ExtractError("Extraction impossible : le document n’a pas pu être lu. Vérifiez le fichier.");
  }

  const direction = parsed.direction === "out" ? "out" : "in";

  const lines = rawLines.slice(0, 60).map((row) => {
    const l = (row && typeof row === "object" ? row : {}) as Record<string, unknown>;
    const unitPrice =
      numOrNull(l.unit_price_ht) ?? numOrNull(l.buy_price) ?? numOrNull(l.sell_price) ?? 0;
    const buy =
      direction === "in"
        ? (numOrNull(l.buy_price) ?? unitPrice)
        : (numOrNull(l.buy_price) ?? 0);
    const sell =
      direction === "out"
        ? (numOrNull(l.sell_price) ?? unitPrice)
        : (numOrNull(l.sell_price) ?? 0);
    return {
      label: String(l.label ?? "").trim() || "Ligne",
      qty: Number(l.qty) || 1,
      unit: String(l.unit ?? "u") || "u",
      buy_price: buy,
      sell_price: sell,
      eco_contribution: numOrNull(l.eco_contribution),
      pmcb: numOrNull(l.pmcb),
      weight_kg: numOrNull(l.weight_kg),
    };
  });

  const lineSum = lines.reduce(
    (s, l) => s + (direction === "out" ? l.sell_price : l.buy_price) * l.qty,
    0,
  );

  const docNumber = String(parsed.document_number ?? "").trim();
  const issueDate = parseIsoDay(parsed.issue_date);
  const deliveryDate = parseIsoDay(parsed.delivery_date);
  const partyAddress = String(parsed.party_address ?? "").trim();
  const titleBase = String(parsed.title ?? "").trim() || fileName;

  const read_assessment = parseReadAssessment(parsed.read_assessment);
  const contact = normalizeSupplierContact({
    name: String(parsed.contact_name ?? "").trim(),
    email: String(parsed.contact_email ?? "").trim(),
    phone: String(parsed.contact_phone ?? "").trim(),
    role: String(parsed.contact_role ?? "").trim(),
  });

  return {
    direction,
    kind: kind as ExtractResult["kind"],
    title: titleBase,
    party_name: String(parsed.party_name ?? "").trim() || "Inconnu",
    party_kind: (parsed.party_kind as ExtractResult["party_kind"]) || (direction === "out" ? "client" : "distributeur"),
    chantier_hint: String(parsed.chantier_hint ?? "").trim(),
    totals: parseTotals(parsed.totals, lineSum),
    lines,
    ...(docNumber ? { document_number: docNumber } : {}),
    ...(issueDate ? { issue_date: issueDate } : {}),
    ...(deliveryDate ? { delivery_date: deliveryDate } : {}),
    ...(partyAddress ? { party_address: partyAddress } : {}),
    ...(contact?.name ? { contact_name: contact.name } : {}),
    ...(contact?.email ? { contact_email: contact.email } : {}),
    ...(contact?.phone ? { contact_phone: contact.phone } : {}),
    ...(contact?.role ? { contact_role: contact.role } : {}),
    ...(read_assessment ? { read_assessment } : {}),
  };
}
