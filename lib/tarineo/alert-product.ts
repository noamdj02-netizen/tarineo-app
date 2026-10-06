import type { PriceAlert } from "@/lib/metier/types";
import { R } from "@/lib/routes";
import { productSlug } from "@/lib/tarineo/product-slug";

/** Ex. « Tube PVC Ø 500 chez Cedeo » → « Tube PVC Ø 500 » */
export function alertProductName(alertLabel: string): string {
  const m = alertLabel.match(/^(.+?)\s+chez\s+/i);
  return (m ? m[1] : alertLabel).trim();
}

export function distributorFromAlertLabel(alertLabel: string): string | null {
  const m = alertLabel.match(/\schez\s+(.+)$/i);
  return m ? m[1].trim() : null;
}

export function alertsMatchingProduct(alerts: PriceAlert[], productName: string): PriceAlert[] {
  const needle = productName.toLowerCase();
  return alerts.filter((a) => {
    const base = alertProductName(a.label).toLowerCase();
    return base === needle || a.label.toLowerCase().startsWith(needle);
  });
}

/** Lien fiche produit (historique prix) — jamais la pièce PDF/devis en premier. */
export function priceAlertProductHref(alert: Pick<PriceAlert, "label">): string {
  const baseName = alertProductName(alert.label);
  if (!baseName) return R.achatsProduits;
  return `${R.achatsProduit(productSlug(baseName))}#historique`;
}

export function resolvePriceAlertHref(
  alert: PriceAlert,
  _articles?: { label: string }[],
): { href: string; kind: "product" | "piece" | "list" } {
  const baseName = alertProductName(alert.label);
  if (baseName) {
    return { href: priceAlertProductHref(alert), kind: "product" };
  }
  if (alert.document_id) {
    return { href: R.piece(alert.document_id), kind: "piece" };
  }
  return { href: R.achatsProduits, kind: "list" };
}
