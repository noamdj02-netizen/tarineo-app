import type {
  FamilyPerformanceRow,
  PriceHistoryPoint,
  QuoteStatsData,
  RecommendedAction,
  SalesPoint,
  SupplierQuoteLine,
  TarineoDistributor,
  TarineoProduct,
} from "@/components/tarineo/types";
import type { FollowUpView } from "@/lib/metier/follow-ups";
import { documentSentAt } from "@/lib/metier/follow-ups";
import { resolveDistributorGoal } from "@/lib/metier/supplier-spend";
import type { DocumentCard, PriceAlert } from "@/lib/metier/types";
import { buildExportPreviewRows } from "@/lib/metier/accounting-export/rows";
import {
  alertProductName,
  alertsMatchingProduct,
  distributorFromAlertLabel,
  priceAlertProductHref,
} from "@/lib/tarineo/alert-product";
import { productSlug } from "@/lib/tarineo/product-slug";
import { R } from "@/lib/routes";
import { variation } from "@/lib/site/tarineo";

export function adaptQuoteStats(outbound: DocumentCard[], followUps: FollowUpView[]): QuoteStatsData {
  const devis = outbound.filter((d) => d.kind === "devis");
  const sent = devis.filter((d) => documentSentAt(d.extract)).length;
  const followup = followUps.filter((f) => f.status === "due" || f.status === "scheduled").length;
  const accepted = outbound.filter((d) => d.kind === "bon_commande" && d.source_document_id).length;
  const refused = 0;
  return { sent, followup, accepted, refused };
}

export function adaptTopPriceIncreases(alerts: PriceAlert[], limit = 6, _articles?: { label: string }[]) {
  return alerts
    .map((a) => {
      const productName = alertProductName(a.label);
      const detailHref = priceAlertProductHref(a);
      return {
        id: a.id,
        label: a.label,
        productName,
        oldPrice: Number(a.old_price),
        newPrice: Number(a.new_price),
        pct: variation(Number(a.old_price), Number(a.new_price)),
        chantierName: a.chantier_name,
        documentId: a.document_id,
        reference: a.product_id ? String(a.product_id).slice(0, 12) : null,
        detailHref,
      };
    })
    .sort((a, b) => b.pct - a.pct)
    .slice(0, limit);
}

export function adaptTopProducts(articles: { label: string; amount: number; qty: number }[], limit = 6) {
  return articles.slice(0, limit).map((a, i) => ({
    id: `art-${i}`,
    name: a.label,
    amountHt: a.amount,
    qty: a.qty,
  }));
}

export function adaptSalesEvolution(months: { key: string; label: string; amount: number }[]): SalesPoint[] {
  return months.map((m) => ({ key: m.key, label: m.label, amount: m.amount }));
}

/** Moyenne des hausses détectées par mois (pour la courbe « prix distributeurs »). */
export function adaptDistributorPriceTrend(alerts: PriceAlert[], limit = 9): SalesPoint[] {
  const buckets = new Map<string, { label: string; pcts: number[] }>();
  for (const a of alerts) {
    const key = a.created_at.slice(0, 7);
    const label = a.created_at.slice(5, 7);
    const pct = variation(Number(a.old_price), Number(a.new_price));
    const row = buckets.get(key) ?? { label, pcts: [] };
    row.pcts.push(pct);
    buckets.set(key, row);
  }
  return [...buckets.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .slice(-limit)
    .map(([key, row]) => ({
      key,
      label: row.label,
      amount: Math.round((row.pcts.reduce((s, x) => s + x, 0) / row.pcts.length) * 10) / 10,
    }));
}

function goalForEnseigne(label: string, amount: number, goals?: Record<string, number>): number | null {
  const set = resolveDistributorGoal(label, goals);
  if (set != null) return set;
  return amount > 0 ? Math.round(amount * 1.15) : null;
}

export function adaptAnnualGoals(
  enseignes: { label: string; amount: number }[],
  goals?: Record<string, number>,
  monthly?: {
    amounts?: { label: string; amount: number }[];
    goals?: Record<string, number>;
  },
): TarineoDistributor[] {
  const monthlyMap = new Map((monthly?.amounts ?? []).map((m) => [m.label.toLowerCase(), m.amount]));
  return enseignes.map((e, i) => ({
    id: `d-${i}`,
    name: e.label,
    amountHt: e.amount,
    goalHt: goalForEnseigne(e.label, e.amount, goals),
    monthlyAmountHt: monthlyMap.get(e.label.toLowerCase()) ?? 0,
    monthlyGoalHt: resolveDistributorGoal(e.label, monthly?.goals),
  }));
}

export function adaptFamilyPerformance(articles: { label: string; amount: number }[]): FamilyPerformanceRow[] {
  const total = articles.reduce((s, a) => s + a.amount, 0) || 1;
  return articles.slice(0, 8).map((a) => ({
    family: a.label.length > 42 ? `${a.label.slice(0, 40)}…` : a.label,
    amountHt: a.amount,
    sharePct: Math.round((a.amount / total) * 1000) / 10,
  }));
}

export function adaptRecommendedActions(input: {
  alerts: PriceAlert[];
  pendingDocs: DocumentCard[];
  devisAEnvoyer: DocumentCard[];
  relancesDue: FollowUpView[];
}): RecommendedAction[] {
  const items: RecommendedAction[] = [];
  if (input.alerts[0]) {
    items.push({
      id: "alert",
      title: "Vérifier une hausse fournisseur",
      description: `${input.alerts[0].label} — comparez avant votre prochain devis client.`,
      href: R.hausses,
      icon: "alert",
    });
  }
  if (input.pendingDocs.length) {
    items.push({
      id: "pending",
      title: "Analyser un document en attente",
      description: `${input.pendingDocs.length} pièce(s) importée(s) sans devis client associé.`,
      href: R.devisAnalyser,
      icon: "file",
    });
  }
  if (input.devisAEnvoyer.length) {
    items.push({
      id: "devis",
      title: "Envoyer un devis client",
      description: `${input.devisAEnvoyer.length} devis prêt(s) à envoyer.`,
      href: R.clientDevis,
      icon: "file",
    });
  }
  if (input.relancesDue.length) {
    items.push({
      id: "relance",
      title: "Relancer un client",
      description: `${input.relancesDue.length} relance(s) à traiter.`,
      href: R.relances,
      icon: "chart",
    });
  }
  return items.slice(0, 4);
}

export function adaptSupplierQuoteLines(doc: DocumentCard | null): SupplierQuoteLine[] {
  if (!doc) return [];
  return doc.lines.map((l, i) => ({
    id: `${doc.id}-${i}`,
    name: l.label,
    reference: null,
    priceHt: Number(l.buy_price || l.sell_price),
    unit: l.unit,
  }));
}

export function adaptSavedProducts(articles: { label: string; amount: number; qty: number }[]): TarineoProduct[] {
  return articles.slice(0, 12).map((a, i) => ({
    id: `saved-${i}`,
    name: a.label,
    supplierRef: null,
    distributorRef: null,
    lastPriceHt: a.qty > 0 ? Math.round((a.amount / a.qty) * 100) / 100 : null,
  }));
}

function lineMatchesProduct(lineLabel: string, productName: string) {
  const a = productName.toLowerCase().trim();
  const b = lineLabel.toLowerCase().trim();
  return b === a || b.startsWith(a) || a.startsWith(b);
}

export function adaptPriceHistoryFromDocuments(
  docs: DocumentCard[],
  productName: string,
): PriceHistoryPoint[] {
  const points: PriceHistoryPoint[] = [];
  for (const d of docs) {
    if (d.direction !== "in") continue;
    for (const l of d.lines) {
      if (!lineMatchesProduct(l.label, productName)) continue;
      points.push({
        date: d.created_at.slice(0, 10),
        priceHt: Number(l.buy_price),
        label: d.party_name ?? undefined,
      });
    }
  }
  return points.sort((x, y) => x.date.localeCompare(y.date));
}

export function adaptPriceHistoryFromAlerts(alerts: PriceAlert[], label: string): PriceHistoryPoint[] {
  const related = alertsMatchingProduct(alerts, label).sort((a, b) =>
    a.created_at.localeCompare(b.created_at),
  );
  const points: PriceHistoryPoint[] = [];
  for (const a of related) {
    const dist = distributorFromAlertLabel(a.label);
    const date = a.created_at.slice(0, 10);
    points.push({
      date,
      priceHt: Number(a.old_price),
      label: dist ? `${dist} (avant)` : "Avant",
    });
    points.push({
      date,
      priceHt: Number(a.new_price),
      label: dist ?? undefined,
    });
  }
  return points;
}

/** Historique achats : lignes de factures/devis + hausses détectées. */
export function adaptProductPriceHistory(
  productName: string,
  alerts: PriceAlert[],
  docs: DocumentCard[],
): PriceHistoryPoint[] {
  const fromDocs = adaptPriceHistoryFromDocuments(docs, productName);
  const fromAlerts = adaptPriceHistoryFromAlerts(alerts, productName);
  const merged = [...fromDocs, ...fromAlerts];
  merged.sort((a, b) => a.date.localeCompare(b.date) || a.priceHt - b.priceHt);
  return merged;
}

export function adaptDistributorPriceSeries(months: SalesPoint[], enseignes: { label: string; amount: number }[]) {
  return {
    months,
    distributors: enseignes.slice(0, 5).map((e) => ({ name: e.label, total: e.amount })),
  };
}

export function adaptExportPreviewRows(docs: DocumentCard[]): Record<string, string | number>[] {
  return buildExportPreviewRows(docs, 20);
}
