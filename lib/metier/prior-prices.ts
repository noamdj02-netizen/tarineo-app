/** Comparaison des prix d’un extrait avec l’historique d’achats (documents entrants). */

export type PriorPriceHit = {
  label: string;
  currentPrice: number;
  priorPrice: number;
  /** Variation en % (positif = plus cher). */
  pct: number;
  priorDocTitle: string;
  priorDocNumber?: string | null;
};

function normLabel(s: string) {
  return s
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function labelsMatch(a: string, b: string) {
  const na = normLabel(a);
  const nb = normLabel(b);
  if (!na || !nb) return false;
  return na === nb || na.includes(nb) || nb.includes(na);
}

export type PriorPriceHistoryDoc = {
  title: string;
  created_at: string;
  document_number?: string | null;
  party_name?: string | null;
  lines: Array<{ label: string; buy_price: number }>;
};

/** Pour chaque ligne courante, dernier prix d’achat connu (même libellé). */
export function findPriorBuyPrices(
  lines: Array<{ label: string; buy_price: number }>,
  history: PriorPriceHistoryDoc[],
  opts?: { minPct?: number },
): PriorPriceHit[] {
  const minPct = opts?.minPct ?? 0;
  const sorted = [...history].sort((a, b) => b.created_at.localeCompare(a.created_at));
  const hits: PriorPriceHit[] = [];

  for (const line of lines) {
    const current = Number(line.buy_price);
    if (!line.label?.trim() || !Number.isFinite(current) || current <= 0) continue;

    let found: PriorPriceHit | null = null;
    for (const doc of sorted) {
      const prev = doc.lines.find((l) => labelsMatch(line.label, l.label) && Number(l.buy_price) > 0);
      if (!prev) continue;
      const prior = Number(prev.buy_price);
      const pct = ((current - prior) / prior) * 100;
      found = {
        label: line.label.trim(),
        currentPrice: current,
        priorPrice: prior,
        pct,
        priorDocTitle: doc.title,
        priorDocNumber: doc.document_number ?? null,
      };
      break;
    }
    if (found && found.pct >= minPct) hits.push(found);
  }

  return hits.sort((a, b) => b.pct - a.pct);
}
