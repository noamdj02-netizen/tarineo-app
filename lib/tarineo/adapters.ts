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
import type { DocumentCard, PriceAlert } from "@/lib/metier/types";
import { buildExportPreviewRows } from "@/lib/metier/accounting-export/rows";
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

export function adaptTopPriceIncreases(alerts: PriceAlert[], limit = 6) {
  return alerts
    .map((a) => ({
      id: a.id,
      label: a.label,
      oldPrice: Number(a.old_price),
      newPrice: Number(a.new_price),
      pct: variation(Number(a.old_price), Number(a.new_price)),
      chantierName: a.chantier_name,
      documentId: a.document_id,
    }))
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

function goalForEnseigne(label: string, amount: number, goals?: Record<string, number>): number | null {
  if (goals) {
    const direct = goals[label];
    if (direct != null && direct > 0) return Math.round(direct);
    const lower = label.toLowerCase();
    for (const [k, v] of Object.entries(goals)) {
      if (k.toLowerCase() === lower && v > 0) return Math.round(v);
    }
  }
  return amount > 0 ? Math.round(amount * 1.15) : null;
}

export function adaptAnnualGoals(
  enseignes: { label: string; amount: number }[],
  goals?: Record<string, number>,
): TarineoDistributor[] {
  return enseignes.map((e, i) => ({
    id: `d-${i}`,
    name: e.label,
    amountHt: e.amount,
    goalHt: goalForEnseigne(e.label, e.amount, goals),
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

export function adaptPriceHistoryFromAlerts(alerts: PriceAlert[], label: string): PriceHistoryPoint[] {
  const related = alerts
    .filter((a) => a.label.toLowerCase() === label.toLowerCase())
    .sort((a, b) => a.created_at.localeCompare(b.created_at));
  const points: PriceHistoryPoint[] = related.map((a) => ({
    date: a.created_at.slice(0, 10),
    priceHt: Number(a.new_price),
  }));
  if (!points.length && related.length === 0) {
    return [];
  }
  return points;
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
