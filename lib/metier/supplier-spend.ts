import type { DocumentCard } from "@/lib/metier/types";

/** Montant HT d’une pièce (lignes achat). */
export function documentSpendHt(doc: DocumentCard): number {
  return doc.lines.reduce((a, l) => a + Number(l.buy_price) * Number(l.qty), 0);
}

/** Pièces rattachées à un party (en-tête ou ligne fournisseur / distributeur). */
export function docsLinkedToParty(docs: DocumentCard[], partyId: string): DocumentCard[] {
  return docs.filter(
    (d) =>
      d.party_id === partyId ||
      d.lines.some((l) => l.supplier_party_id === partyId || l.distributor_party_id === partyId),
  );
}

export function periodBounds(kind: "month" | "year", ref: Date = new Date()): { from: Date; to: Date } {
  if (kind === "month") {
    const from = new Date(ref.getFullYear(), ref.getMonth(), 1);
    const to = new Date(ref.getFullYear(), ref.getMonth() + 1, 1);
    return { from, to };
  }
  const from = new Date(ref.getFullYear(), 0, 1);
  const to = new Date(ref.getFullYear() + 1, 0, 1);
  return { from, to };
}

export function docsInPeriod(docs: DocumentCard[], from: Date, to: Date): DocumentCard[] {
  return docs.filter((d) => {
    const t = new Date(d.created_at);
    return t >= from && t < to;
  });
}

export function spendInPeriod(docs: DocumentCard[], from: Date, to: Date): number {
  return docsInPeriod(docs, from, to).reduce((s, d) => s + documentSpendHt(d), 0);
}

export function spendForPartyInPeriod(
  docs: DocumentCard[],
  partyId: string,
  kind: "month" | "year",
  ref: Date = new Date(),
): number {
  const { from, to } = periodBounds(kind, ref);
  return spendInPeriod(docsLinkedToParty(docs, partyId), from, to);
}

/** Agrégation par nom d’enseigne (en-tête document) sur une période. */
export function spendByEnseigneInPeriod(
  docs: DocumentCard[],
  kind: "month" | "year",
  ref: Date = new Date(),
): { label: string; amount: number }[] {
  const { from, to } = periodBounds(kind, ref);
  const byParty = new Map<string, number>();
  for (const d of docsInPeriod(docs, from, to)) {
    const party = d.party_name?.trim() || "Enseigne";
    byParty.set(party, (byParty.get(party) ?? 0) + documentSpendHt(d));
  }
  return [...byParty.entries()]
    .map(([label, amount]) => ({ label, amount }))
    .sort((a, b) => b.amount - a.amount);
}

/** Résout un objectif par libellé (insensible à la casse). */
export function resolveDistributorGoal(label: string, goals?: Record<string, number> | null): number | null {
  if (!goals) return null;
  const direct = goals[label];
  if (direct != null && direct > 0) return Math.round(direct);
  const lower = label.toLowerCase();
  for (const [k, v] of Object.entries(goals)) {
    if (k.toLowerCase() === lower && v > 0) return Math.round(v);
  }
  return null;
}

export function spendGaugePct(current: number, goal: number | null | undefined): number {
  if (!goal || goal <= 0) return 0;
  return Math.min(100, Math.round((current / goal) * 100));
}
