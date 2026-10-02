import "server-only";
import { createNotification } from "@/lib/notifications/service";
import { getNotificationPreferences } from "@/lib/settings/notification-store";
import type { DocumentCard } from "@/lib/metier/types";
import type { FollowUpView } from "@/lib/metier/follow-ups";

function euro(v: number) {
  return new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR" }).format(v);
}

/** Hausses regroupées par document — 1 notification max. */
export async function notifySupplierIncreases(input: {
  documentId: string;
  partyName?: string | null;
  items: { label: string; oldPrice: number; newPrice: number; pct: number }[];
}) {
  try {
    const prefs = await getNotificationPreferences();
    const threshold = prefs.supplierThresholdPct ?? 5;
    const significant = input.items.filter((i) => i.pct >= threshold);
    if (!significant.length) return;

    const top = [...significant].sort((a, b) => b.pct - a.pct)[0];
    const party = input.partyName?.trim() || "Fournisseur";
    const count = significant.length;
    const title = "Hausse fournisseur détectée";
    const message =
      count === 1
        ? `${top.label}\n${party}\n\n+${top.pct.toFixed(1)} % par rapport au dernier prix connu.`
        : `${count} produits ont augmenté chez ${party}.\nEx. ${top.label} : +${top.pct.toFixed(1)} %.`;

    await createNotification({
      type: "supplier_price_increase",
      title,
      message,
      priority: top.pct >= threshold * 2 ? "critical" : "high",
      actionUrl: `/pieces/${input.documentId}`,
      entityType: "document",
      entityId: input.documentId,
      preferenceChannel: "supplier",
      idempotencyKey: `supplier_price_increase:document:${input.documentId}`,
      metadata: {
        count,
        threshold,
        topPct: top.pct,
        labels: significant.map((i) => i.label).slice(0, 8),
      },
    });
  } catch (err) {
    console.error("[notifySupplierIncreases]", err);
  }
}

export async function notifyClientFollowUp(view: FollowUpView) {
  try {
    if (view.status !== "due") return;
    const amount = view.amount_ht ? euro(view.amount_ht) : null;
    const contact = view.contact && view.contact !== "—" ? view.contact : "votre client";
    await createNotification({
      type: "client_followup",
      title: `Relance à faire — ${contact}`,
      message: amount
        ? `Votre devis de ${amount} n’a pas encore reçu de réponse.`
        : `Votre document « ${view.document_title} » n’a pas encore reçu de réponse.`,
      priority: "high",
      actionUrl: `/pieces/${view.document_id}`,
      entityType: "document",
      entityId: view.document_id,
      preferenceChannel: "followups",
      idempotencyKey: `client_followup:document:${view.document_id}:due`,
      metadata: { followUpId: view.id, contact },
    });
  } catch (err) {
    console.error("[notifyClientFollowUp]", err);
  }
}

export async function notifyQuoteReady(doc: DocumentCard) {
  try {
    if (doc.kind !== "devis" || doc.direction !== "out") return;
    const client = doc.party_name?.trim() || doc.title;
    await createNotification({
      type: "quote_ready",
      title: "Votre devis est prêt",
      message: `Le devis ${client} a été généré et peut être envoyé.`,
      priority: "normal",
      actionUrl: `/pieces/${doc.id}`,
      entityType: "document",
      entityId: doc.id,
      preferenceChannel: "quotes",
      idempotencyKey: `quote_ready:document:${doc.id}`,
    });
  } catch (err) {
    console.error("[notifyQuoteReady]", err);
  }
}

export async function notifyQuoteToSend(doc: DocumentCard) {
  try {
    if (doc.kind !== "devis" || doc.direction !== "out") return;
    const ageMs = Date.now() - Date.parse(doc.created_at);
    // Pas immédiatement après création — au moins ~2 h
    if (!Number.isFinite(ageMs) || ageMs < 2 * 3600_000) return;
    const client = doc.party_name?.trim() || doc.title;
    await createNotification({
      type: "quote_to_send",
      title: "Devis à envoyer",
      message: `Le devis ${client} attend toujours votre envoi.`,
      priority: "high",
      actionUrl: `/pieces/${doc.id}`,
      entityType: "document",
      entityId: doc.id,
      preferenceChannel: "quotes",
      idempotencyKey: `quote_to_send:document:${doc.id}`,
    });
  } catch (err) {
    console.error("[notifyQuoteToSend]", err);
  }
}

export async function notifyDocumentAnalyzed(doc: DocumentCard, attentionCount: number) {
  try {
    const party = doc.party_name?.trim() || "document";
    await createNotification({
      type: "document_analyzed",
      title: "Analyse terminée",
      message:
        attentionCount > 0
          ? `Votre ${doc.kind === "facture" ? "facture" : "document"} ${party} a été analysé.\n${attentionCount} élément${attentionCount > 1 ? "s" : ""} nécessite${attentionCount > 1 ? "nt" : ""} votre attention.`
          : `Votre ${doc.kind === "facture" ? "facture" : "document"} ${party} a été analysé.`,
      priority: attentionCount > 0 ? "high" : "normal",
      actionUrl: `/pieces/${doc.id}`,
      entityType: "document",
      entityId: doc.id,
      preferenceChannel: doc.kind === "facture" ? "invoices" : "projects",
      idempotencyKey: `document_analyzed:document:${doc.id}`,
      metadata: { attentionCount },
    });
  } catch (err) {
    console.error("[notifyDocumentAnalyzed]", err);
  }
}

export async function notifyInvoiceAnomaly(input: {
  documentId: string;
  reasons: string[];
  partyName?: string | null;
}) {
  try {
    if (!input.reasons.length) return;
    await createNotification({
      type: "invoice_anomaly",
      title: "Anomalie détectée sur une facture",
      message: input.reasons.slice(0, 3).join("\n"),
      priority: "critical",
      actionUrl: `/pieces/${input.documentId}`,
      entityType: "document",
      entityId: input.documentId,
      preferenceChannel: "invoices",
      idempotencyKey: `invoice_anomaly:document:${input.documentId}`,
      metadata: { reasons: input.reasons },
    });
  } catch (err) {
    console.error("[notifyInvoiceAnomaly]", err);
  }
}

export async function notifySiteActivity(input: {
  chantierId: string;
  chantierSlug: string;
  chantierName: string;
  message: string;
  documentId?: string;
}) {
  try {
    await createNotification({
      type: "site_activity",
      title: `Chantier ${input.chantierName}`,
      message: input.message,
      priority: "normal",
      actionUrl: `/chantiers/${input.chantierSlug}`,
      entityType: "chantier",
      entityId: input.chantierId,
      preferenceChannel: "projects",
      idempotencyKey: `site_activity:chantier:${input.chantierId}:doc:${input.documentId ?? "none"}`,
    });
  } catch (err) {
    console.error("[notifySiteActivity]", err);
  }
}

/** Synchronise les relances dues / devis à envoyer → notifications (idempotent). */
export async function syncOperationalNotifications(input: {
  followUpsDue: FollowUpView[];
  devisAEnvoyer: DocumentCard[];
}) {
  for (const fu of input.followUpsDue.slice(0, 20)) {
    await notifyClientFollowUp(fu);
  }
  for (const d of input.devisAEnvoyer.slice(0, 20)) {
    await notifyQuoteToSend(d);
  }
}
