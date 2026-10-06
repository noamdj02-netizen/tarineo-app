/** Données démo — transformation devis fournisseur → client (landing, sans API). */

import { LANDING_EXAMPLE_SUPPLIER_FILE } from "@/lib/site/landing-quote-extract-sim";

export type LandingDemoLine = {
  ref: string;
  label: string;
  qty: number;
  unitHt: number;
};

export const LANDING_QUOTE_DEMO = {
  supplierTitle: "Devis fournisseur",
  supplierSubtitle: "Réf. fournisseur 2026-014",
  clientTitle: "Devis client",
  clientSubtitle: "Rénovation SDB — Dupont",
  clientName: "M. Lefevre Jean",
  lines: [
    { ref: "PVC100", label: "Tube PVC évacuation Ø 100", qty: 6, unitHt: 18.4 },
    { ref: "C2S1", label: "Colle carrelage flexible C2 S1", qty: 4, unitHt: 36.2 },
  ] satisfies LandingDemoLine[],
  defaultMarginPct: 32,
  minMarginPct: 25,
} as const;

export function formatEuroHt(value: number) {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

/** Marge commerciale : majoration sur le prix d'achat (cohérent avec les montants démo existants). */
export function clientUnitFromSupplier(unitHt: number, marginPct: number) {
  return unitHt * (1 + marginPct / 100);
}

export function lineTotalHt(qty: number, unitHt: number) {
  return qty * unitHt;
}

export function sumLines(lines: LandingDemoLine[], marginPct: number, mode: "supplier" | "client") {
  return lines.reduce((acc, line) => {
    const unit =
      mode === "supplier" ? line.unitHt : clientUnitFromSupplier(line.unitHt, marginPct);
    return acc + lineTotalHt(line.qty, unit);
  }, 0);
}

export function buildClientQuoteText({
  marginPct,
  clientName,
}: {
  marginPct: number;
  clientName: string;
}) {
  const { lines, supplierSubtitle, clientSubtitle } = LANDING_QUOTE_DEMO;
  const rows = lines.map((line) => {
    const unit = clientUnitFromSupplier(line.unitHt, marginPct);
    const total = lineTotalHt(line.qty, unit);
    return `${line.ref} · ${line.label}\n  ${line.qty} × ${formatEuroHt(unit)} HT = ${formatEuroHt(total)} HT`;
  });

  const totalHt = sumLines(lines, marginPct, "client");

  return [
    "DEVIS CLIENT — Exemple généré sur tarineo.fr",
    "(Document de démonstration, sans valeur contractuelle)",
    "",
    `Client : ${clientName}`,
    `Chantier : ${clientSubtitle}`,
    `Référence achat : ${supplierSubtitle}`,
    `Marge appliquée : ${marginPct} %`,
    "",
    ...rows,
    "",
    `Total HT : ${formatEuroHt(totalHt)}`,
    "",
    "— Tarinéo · L'administratif des artisans, en pilote automatique",
  ].join("\n");
}

export type LandingClientPdfResult = "ok" | "pdf_failed" | "quota_exceeded";

export async function downloadClientQuoteDemo(
  marginPct: number,
  clientName: string,
  sourceRef?: string | null,
): Promise<LandingClientPdfResult> {
  const res = await fetch("/api/landing/devis-demo", {
    method: "POST",
    credentials: "same-origin",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      kind: "client",
      marginPct,
      clientName,
      sourceRef: sourceRef ?? undefined,
    }),
  });

  if (res.status === 403) return "quota_exceeded";
  if (!res.ok) return "pdf_failed";

  const blob = await res.blob();
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = "devis-client-exemple-tarineo.pdf";
  anchor.click();
  URL.revokeObjectURL(url);
  return "ok";
}

export async function downloadSupplierQuoteDemo(): Promise<boolean> {
  const res = await fetch("/api/landing/devis-demo?kind=supplier", {
    credentials: "same-origin",
  });
  if (!res.ok) return false;

  const blob = await res.blob();
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = LANDING_EXAMPLE_SUPPLIER_FILE;
  anchor.click();
  URL.revokeObjectURL(url);
  return true;
}
