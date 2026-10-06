import type { DocumentCard } from "@/lib/metier/types";

export type DocumentMargin = {
  marginPct: number;
  sellHt: number;
  costHt: number;
  linesWithCost: number;
};

export function computeDocumentMarginPct(doc: DocumentCard): DocumentMargin | null {
  if (doc.direction !== "out" || doc.kind !== "devis" || doc.status !== "ready" || doc.error) return null;

  let costHt = 0;
  let sellHt = 0;
  let linesWithCost = 0;

  for (const line of doc.lines) {
    const buy = Number(line.buy_price);
    const sell = Number(line.sell_price || line.buy_price);
    const qty = Number(line.qty) || 0;
    if (!qty) continue;
    if (buy > 0 && sell > 0) {
      linesWithCost += 1;
      costHt += buy * qty;
      sellHt += sell * qty;
    }
  }

  if (sellHt <= 0) return null;
  const marginHt = sellHt - costHt;
  const marginPct = Math.round((marginHt / sellHt) * 1000) / 10;
  return { marginPct, sellHt, costHt, linesWithCost };
}
