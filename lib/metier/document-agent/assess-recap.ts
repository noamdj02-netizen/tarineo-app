import type { ExtractReadAssessment } from "@/lib/metier/types";
import type { DocumentAgentMeta, DocumentRecap, ReliabilityLevel } from "@/lib/metier/document-agent/types";
import type { ExtractResult } from "@/lib/metier/types";
import { KIND_LABEL } from "@/lib/metier/types";

function lineSumHt(extracted: ExtractResult): number {
  return extracted.lines.reduce((s, l) => {
    const unit = extracted.direction === "out" ? (l.sell_price ?? 0) : l.buy_price;
    return s + unit * l.qty;
  }, 0);
}

function totalsAligned(extracted: ExtractResult): boolean | null {
  const ht = extracted.totals?.ht;
  if (ht == null || ht <= 0) return null;
  const sum = lineSumHt(extracted);
  if (sum <= 0) return null;
  const diff = Math.abs(ht - sum) / ht;
  return diff <= 0.03;
}

function fallbackSummary(extracted: ExtractResult): string {
  const kind = KIND_LABEL[extracted.kind] ?? extracted.kind;
  const n = extracted.lines.length;
  const ht = extracted.totals?.ht;
  const parts = [
    `${kind}${extracted.document_number ? ` n° ${extracted.document_number}` : ""}`,
    extracted.party_name && extracted.party_name !== "Inconnu" ? `— ${extracted.party_name}` : "",
    `— ${n} ligne${n > 1 ? "s" : ""} lue${n > 1 ? "s" : ""}`,
  ];
  if (ht != null) parts.push(`— total HT ${ht.toFixed(2)} €`);
  if (extracted.chantier_hint) parts.push(`— chantier / livraison : ${extracted.chantier_hint}`);
  return parts.filter(Boolean).join(" ").replace(/\s+/g, " ").trim();
}

function reliabilityFromScore(score: number): ReliabilityLevel {
  if (score >= 78) return "fiable";
  if (score >= 52) return "a_verifier";
  return "peu_fiable";
}

/** Synthèse + score de fiabilité (règles déterministes + lecture modèle). */
export function buildDocumentRecap(
  extracted: ExtractResult,
  agent: DocumentAgentMeta,
  assessment?: ExtractReadAssessment | null,
): DocumentRecap {
  const linesSumHt = Math.round(lineSumHt(extracted) * 100) / 100;
  const aligned = totalsAligned(extracted);
  const caveats = [...(assessment?.caveats ?? [])];

  let score = 42;
  const checks: DocumentRecap["checks"] = [];

  if (agent.vendor_key !== "unknown") {
    score += 14;
    checks.push({ id: "vendor", label: "Enseigne reconnue", ok: true, detail: agent.vendor_display_name });
  } else {
    checks.push({ id: "vendor", label: "Enseigne reconnue", ok: false, detail: "Non identifiée — vérifiez le fournisseur." });
    caveats.push("Fournisseur non reconnu dans le répertoire BTP.");
  }

  if (agent.confidence === "high") score += 8;
  else if (agent.confidence === "medium") score += 4;

  if (extracted.party_name && extracted.party_name !== "Inconnu") {
    score += 8;
    checks.push({ id: "party", label: "Émetteur / destinataire lu", ok: true });
  } else {
    score -= 12;
    checks.push({ id: "party", label: "Émetteur / destinataire lu", ok: false });
  }

  if (extracted.document_number) {
    score += 6;
    checks.push({ id: "number", label: "N° de document", ok: true });
  } else {
    checks.push({ id: "number", label: "N° de document", ok: false, detail: "Absent ou illisible." });
  }

  if (extracted.totals?.ht != null && extracted.totals.ht > 0) {
    score += 10;
    checks.push({ id: "total", label: "Total HT lu", ok: true });
  } else {
    score -= 6;
    checks.push({ id: "total", label: "Total HT lu", ok: false });
    caveats.push("Total HT global absent ou illisible.");
  }

  if (aligned === true) {
    score += 14;
    checks.push({ id: "coherence", label: "Lignes ↔ total HT", ok: true, detail: "Écart ≤ 3 %." });
  } else if (aligned === false) {
    score -= 16;
    checks.push({
      id: "coherence",
      label: "Lignes ↔ total HT",
      ok: false,
      detail: `Somme lignes ${linesSumHt.toFixed(2)} € vs total lu ${extracted.totals?.ht?.toFixed(2)} €.`,
    });
    caveats.push("Écart entre la somme des lignes et le total HT — à contrôler.");
  } else {
    checks.push({ id: "coherence", label: "Lignes ↔ total HT", ok: false, detail: "Comparaison impossible." });
  }

  if (extracted.lines.length >= 1) {
    score += 6;
    checks.push({ id: "lines", label: "Lignes produits", ok: true, detail: String(extracted.lines.length) });
  } else {
    checks.push({ id: "lines", label: "Lignes produits", ok: false });
  }

  const hasContact =
    Boolean(extracted.contact_email?.trim()) ||
    Boolean(extracted.contact_name?.trim()) ||
    Boolean(extracted.contact_phone?.trim());
  if (hasContact) {
    score += 4;
    const bits = [
      extracted.contact_name?.trim(),
      extracted.contact_email?.trim(),
      extracted.contact_phone?.trim(),
    ].filter(Boolean);
    checks.push({
      id: "contact",
      label: "Contact commercial",
      ok: true,
      detail: bits.join(" · "),
    });
  } else if (extracted.direction === "in" && (extracted.kind === "devis" || extracted.kind === "bon_commande")) {
    checks.push({
      id: "contact",
      label: "Contact commercial",
      ok: false,
      detail: "Absent sur le document.",
    });
  }

  if (assessment?.quality === "fiable") score += 10;
  else if (assessment?.quality === "partiel") score -= 4;
  else if (assessment?.quality === "incertain") score -= 14;

  if (assessment?.quality) {
    checks.push({
      id: "read",
      label: "Lisibilité du fichier",
      ok: assessment.quality === "fiable",
      detail:
        assessment.quality === "fiable"
          ? "Document net"
          : assessment.quality === "partiel"
            ? "Zones floues ou coupées"
            : "Lecture difficile",
    });
  }

  score = Math.max(0, Math.min(100, Math.round(score)));
  const reliability = reliabilityFromScore(score);

  const uniqueCaveats = [...new Set(caveats.map((c) => c.trim()).filter(Boolean))].slice(0, 5);

  return {
    summary: (assessment?.summary?.trim() || fallbackSummary(extracted)).slice(0, 520),
    reliability,
    score,
    checks,
    caveats: uniqueCaveats,
    stats: {
      lineCount: extracted.lines.length,
      totalHt: extracted.totals?.ht ?? null,
      linesSumHt: linesSumHt > 0 ? linesSumHt : null,
      totalsAligned: aligned,
    },
  };
}
