import type { ExtractResult } from "@/lib/metier/types";
import type { LandingDemoLine } from "@/lib/site/landing-quote-transform-demo";
import type { LandingExtractLine, LandingExtractPayload } from "@/lib/site/landing-quote-extract.types";

export function supplierUnitHt(line: ExtractResult["lines"][number], direction: ExtractResult["direction"]) {
  if (direction === "in") return Number(line.buy_price) || 0;
  return Number(line.sell_price) || Number(line.buy_price) || 0;
}

export function mapExtractToLandingPayload(
  extracted: ExtractResult,
  fileName: string,
): LandingExtractPayload {
  const direction = extracted.direction;
  const lines: LandingExtractLine[] = [];
  extracted.lines.forEach((line, index) => {
    const unitPriceHT = supplierUnitHt(line, direction);
    if (unitPriceHT <= 0 && !line.label.trim()) return;
    if (unitPriceHT <= 0) return;
    lines.push({
      label: line.label.trim() || `Ligne ${index + 1}`,
      qty: Number(line.qty) > 0 ? Number(line.qty) : 1,
      unitPriceHT: Math.round(unitPriceHT * 100) / 100,
      vatRate: 20,
    });
  });

  const supplierTotalHT = Math.round(
    lines.reduce((acc, l) => acc + l.qty * l.unitPriceHT, 0) * 100,
  ) / 100;

  const quality = extracted.read_assessment?.quality ?? "partiel";
  const caveats = extracted.read_assessment?.caveats ?? [];
  const uncertain = quality !== "fiable" || caveats.length > 0;

  let customerName: string | undefined;
  let customerAddress: string | undefined;
  let supplierName: string | undefined;
  let supplierAddress: string | undefined;

  if (direction === "out") {
    customerName = extracted.party_name?.trim() || undefined;
    customerAddress = extracted.party_address?.trim() || undefined;
  } else {
    supplierName = extracted.party_name?.trim() || undefined;
    supplierAddress = extracted.party_address?.trim() || undefined;
    const hint = extracted.chantier_hint?.trim();
    if (hint && hint.length > 3) {
      customerAddress = hint;
    }
  }

  const sourceRef =
    extracted.document_number?.trim() ||
    extracted.title?.trim() ||
    fileName.replace(/\.[^.]+$/i, "").slice(0, 72);

  return {
    supplierName,
    supplierAddress,
    customerName,
    customerAddress,
    documentNumber: extracted.document_number?.trim() || undefined,
    issueDate: extracted.issue_date?.trim() || undefined,
    sourceRef,
    lines,
    supplierTotalHT,
    quality,
    caveats,
    uncertain,
    summary: extracted.read_assessment?.summary,
  };
}

export function landingExtractToDemoLines(lines: LandingExtractLine[]): LandingDemoLine[] {
  return lines.map((line, index) => ({
    ref: line.reference?.trim() || `L${index + 1}`,
    label: line.label,
    qty: line.qty,
    unitHt: line.unitPriceHT,
  }));
}

export function sanitizeLandingExtractLines(raw: unknown): LandingExtractLine[] | null {
  if (!Array.isArray(raw) || raw.length === 0 || raw.length > 60) return null;
  const out: LandingExtractLine[] = [];
  for (const row of raw) {
    if (!row || typeof row !== "object") continue;
    const r = row as Record<string, unknown>;
    const label = String(r.label ?? "").trim().slice(0, 400);
    const qty = Number(r.qty);
    const unitPriceHT = Number(r.unitPriceHT);
    const vatRate = Number(r.vatRate ?? 20);
    if (!label || !Number.isFinite(qty) || qty <= 0 || !Number.isFinite(unitPriceHT) || unitPriceHT < 0) {
      continue;
    }
    out.push({
      label,
      reference: typeof r.reference === "string" ? r.reference.slice(0, 80) : undefined,
      qty: Math.min(qty, 1_000_000),
      unitPriceHT: Math.round(unitPriceHT * 100) / 100,
      vatRate: Number.isFinite(vatRate) ? Math.min(Math.max(vatRate, 0), 100) : 20,
    });
  }
  return out.length ? out : null;
}
