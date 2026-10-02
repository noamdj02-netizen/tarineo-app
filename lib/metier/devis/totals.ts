import type { DevisLine, QuoteLineTotal, QuoteTotals } from "@/lib/metier/devis/types";

/** Arrondi monétaire à 2 décimales (centimes). */
export function roundMoney(value: number): number {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

/**
 * Calcul serveur unique des totaux devis.
 * Ne jamais faire confiance aux totaux envoyés par le navigateur.
 */
export function calculateQuoteTotals(lines: DevisLine[]): QuoteTotals {
  const computed: QuoteLineTotal[] = lines.map((l) => {
    const quantity = Number.isFinite(l.quantity) && l.quantity > 0 ? l.quantity : 0;
    const unitPriceHT = Number.isFinite(l.unitPriceHT) && l.unitPriceHT >= 0 ? l.unitPriceHT : 0;
    const vatRate = Number.isFinite(l.vatRate) && l.vatRate >= 0 ? l.vatRate : 0;
    const totalHT = roundMoney(quantity * unitPriceHT);
    const totalTVA = roundMoney(totalHT * (vatRate / 100));
    return {
      description: l.description.trim() || "Prestation",
      quantity,
      unit: l.unit?.trim() || "u",
      unitPriceHT,
      vatRate,
      totalHT,
      totalTVA,
      totalTTC: roundMoney(totalHT + totalTVA),
    };
  });

  const totalHT = roundMoney(computed.reduce((s, l) => s + l.totalHT, 0));
  const totalTVA = roundMoney(computed.reduce((s, l) => s + l.totalTVA, 0));
  return {
    lines: computed,
    totalHT,
    totalTVA,
    totalTTC: roundMoney(totalHT + totalTVA),
  };
}

export function formatEuro(value: number): string {
  return new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR" }).format(value);
}
