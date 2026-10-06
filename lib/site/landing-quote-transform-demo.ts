/** Données démo — fallback UI + PDF fournisseur exemple. */

import type { LandingExtractLine } from "@/lib/site/landing-quote-extract.types";

export const LANDING_EXAMPLE_SUPPLIER_FILE = "devis-fournisseur-exemple-tarineo.pdf";

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
  defaultMarginPct: 25,
  minMarginPct: 25,
} as const;

export type LandingDemoOutputKind = "devis" | "facture" | "bon_commande" | "bon_enlevement";

/** Libellés UI → kind PDF métier (`genererPdfPiece`). */
export const LANDING_DEMO_OUTPUT_OPTIONS: { label: string; kind: LandingDemoOutputKind }[] = [
  { label: "Devis client", kind: "devis" },
  { label: "Facture client", kind: "facture" },
  { label: "Bon de commande client", kind: "bon_commande" },
  { label: "Bon d'enlèvement", kind: "bon_enlevement" },
];

export const LANDING_DEMO_SOURCE_OPTIONS = [
  "Devis fournisseur",
  "Facture fournisseur",
  "Bon de commande",
  "Autre document compatible",
] as const;

export function demoPdfDownloadName(kind: LandingDemoOutputKind, clientName: string): string {
  const slug = clientName
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .replace(/[^a-zA-Z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48);
  const prefix =
    kind === "devis"
      ? "Devis"
      : kind === "facture"
        ? "Facture"
        : kind === "bon_commande"
          ? "Bon-commande"
          : "Bon-enlevement";
  return slug ? `${prefix}-TARINEO-${slug}.pdf` : `${prefix}-TARINEO.pdf`;
}

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

export function sumExtractLines(
  lines: LandingExtractLine[],
  marginPct: number,
  mode: "supplier" | "client",
) {
  return lines.reduce((acc, line) => {
    const unit =
      mode === "supplier" ? line.unitPriceHT : clientUnitFromSupplier(line.unitPriceHT, marginPct);
    return acc + lineTotalHt(line.qty, unit);
  }, 0);
}

export type LandingClientPdfResult = "ok" | "pdf_failed" | "quota_exceeded";

export async function uploadLandingDemoExtract(file: File): Promise<
  | { ok: true; extraction: import("@/lib/site/landing-quote-extract.types").LandingExtractPayload }
  | { ok: false; message: string }
> {
  const form = new FormData();
  form.append("file", file);
  const res = await fetch("/api/landing/devis-demo/extract", {
    method: "POST",
    credentials: "same-origin",
    body: form,
  });
  const json = (await res.json()) as {
    ok?: boolean;
    message?: string;
    extraction?: import("@/lib/site/landing-quote-extract.types").LandingExtractPayload;
  };
  if (!res.ok || !json.ok || !json.extraction) {
    return {
      ok: false,
      message:
        json.message ??
        (res.status === 429
          ? "Trop d’analyses en peu de temps. Réessayez plus tard."
          : "Analyse impossible. Votre essai n’a pas été consommé."),
    };
  }
  return { ok: true, extraction: json.extraction };
}

export async function downloadClientQuoteDemo(input: {
  marginPct: number;
  clientName: string;
  clientAddress?: string | null;
  sourceRef?: string | null;
  documentKind: LandingDemoOutputKind;
  lines: LandingExtractLine[];
  documentNumber?: string;
  issueDate?: string;
}): Promise<LandingClientPdfResult> {
  const res = await fetch("/api/landing/devis-demo", {
    method: "POST",
    credentials: "same-origin",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      kind: "client",
      marginPct: input.marginPct,
      clientName: input.clientName,
      clientAddress: input.clientAddress ?? undefined,
      sourceRef: input.sourceRef ?? undefined,
      documentKind: input.documentKind,
      lines: input.lines,
      documentNumber: input.documentNumber,
      issueDate: input.issueDate,
    }),
  });

  if (res.status === 403) return "quota_exceeded";
  if (!res.ok) return "pdf_failed";

  const blob = await res.blob();
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = demoPdfDownloadName(input.documentKind, input.clientName);
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
