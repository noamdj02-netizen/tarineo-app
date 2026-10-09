"use server";

import { revalidatePath } from "next/cache";
import { getDb } from "@/lib/db";
import { ingestDocumentWithAgent } from "@/lib/metier/document-agent/extract-with-agent";
import { learnFromConfirmation } from "@/lib/metier/document-agent/learn";
import { assertCompanyProfileReady } from "@/lib/metier/require-company";
import type { DocumentAgentMeta, DocumentRecap } from "@/lib/metier/document-agent/types";
import type { ExtractResult } from "@/lib/metier/types";
import {
  addDocumentLine,
  createChantier,
  createParty,
  deleteChantier,
  getDocument,
  listChantiers,
  listDocuments,
  listParties,
  recordPriceAlerts,
  saveExtractedDocument,
  setChantierStatus,
  transformImportedDocument,
  updateDocument,
} from "@/lib/metier/queries";
import {
  markDocumentSent,
  scheduleFollowUpForDocument,
  sendDocumentMail,
  setFollowUpStatus,
  upsertFollowUp,
} from "@/lib/metier/follow-up-queries";
import { followUpStillEligible, isDocumentTransformed, type FollowUpStatus } from "@/lib/metier/follow-ups";
import type { ChantierStatus, ClientOutKind, DocDirection, DocKind, ExtractTotals, PartyKind } from "@/lib/metier/types";
import { draftDocumentMail } from "@/lib/metier/draft-mail";
import { CLIENT_DEVIS_NEXT_KINDS, CLIENT_OUT_KINDS, KIND_LABEL, marginToMarkup } from "@/lib/metier/types";

function refresh() {
  for (const p of [
    "/accueil",
    "/copilote",
    "/distributeur",
    "/hausses",
    "/achats",
    "/achats/export",
    "/chantiers",
    "/client",
    "/client/devis",
    "/client/bon-commande",
    "/client/facture",
    "/distributeur/devis",
    "/distributeur/bon-commande",
    "/distributeur/bon-enlevement",
    "/distributeur/facture",
    "/fournisseurs",
    "/comparateur",
    "/pieces",
    "/relances",
    "/devis/analyser",
    "/devis/nouveau",
  ]) {
    revalidatePath(p);
  }
}

export async function ingestDocument(form: FormData) {
  const file = form.get("file");
  if (!(file instanceof File) || file.size === 0) return { ok: false as const, error: "Aucun fichier." };
  if (file.size > 12 * 1024 * 1024) return { ok: false as const, error: "Fichier trop lourd (12 Mo max)." };

  const buf = Buffer.from(await file.arrayBuffer());
  const { createHash } = await import("crypto");
  const fileSha256 = createHash("sha256").update(buf).digest("hex");
  const db = await getDb();
  let filePath = "";
  if (db) {
    const safeName = file.name.replace(/[^\w.\-]+/g, "_");
    filePath = `${db.user.id}/${fileSha256}-${safeName}`;
    const { error } = await db.supabase.storage.from("documents").upload(filePath, buf, {
      contentType: file.type || "application/octet-stream",
      upsert: true,
    });
    if (error) {
      return { ok: false as const, error: "Impossible d’enregistrer le fichier. Réessayez." };
    }
  }

  try {
    const { extracted, agent, recap } = await ingestDocumentWithAgent({
      fileName: file.name,
      mime: file.type || "application/octet-stream",
      base64: buf.toString("base64"),
    });
    const { track } = await import("@/lib/analytics/track");
    void track({
      name: "document_ingested",
      userId: db?.user.id ?? null,
      feature: "analyses",
      path: "/devis/analyser",
      properties: { kind: extracted.kind, mime: file.type || null },
    });
    return { ok: true as const, extracted, agent, recap, filePath, fileName: file.name, fileSha256 };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Extraction impossible.";
    return { ok: false as const, error: message };
  }
}

/** Anciens prix d’achat pour préparer un mail de renégociation. */
export async function lookupPriorBuyPrices(
  lines: Array<{ label: string; buy_price: number }>,
): Promise<{ ok: true; hits: import("@/lib/metier/prior-prices").PriorPriceHit[] }> {
  const { findPriorBuyPrices } = await import("@/lib/metier/prior-prices");
  if (!lines?.length) return { ok: true, hits: [] };
  const history = await listDocuments({ direction: "in", limit: 80 });
  const hits = findPriorBuyPrices(
    lines,
    history.map((d) => ({
      title: d.title,
      created_at: d.created_at,
      document_number:
        typeof d.extract?.document_number === "string" ? d.extract.document_number : null,
      party_name: d.party_name,
      lines: d.lines.map((l) => ({ label: l.label, buy_price: Number(l.buy_price) })),
    })),
  );
  return { ok: true, hits };
}

export async function confirmDocument(input: {
  title: string;
  direction: DocDirection;
  kind: DocKind;
  partyName: string;
  partyKind: PartyKind;
  chantierId: string | null;
  filePath?: string;
  fileSha256?: string;
  totals?: ExtractTotals;
  documentNumber?: string | null;
  issueDate?: string | null;
  partyAddress?: string | null;
  contactName?: string | null;
  contactEmail?: string | null;
  contactPhone?: string | null;
  /** Date de livraison prévue AAAA-MM-JJ → extract + événement calendrier. */
  deliveryDate?: string | null;
  rawExtract?: ExtractResult | null;
  agentMeta?: DocumentAgentMeta | null;
  readRecap?: DocumentRecap | null;
  lines: Array<{
    label: string;
    qty: number;
    unit: string;
    buy_price: number;
    sell_price?: number;
    eco_contribution?: number | null;
    pmcb?: number | null;
    weight_kg?: number | null;
  }>;
}) {
  if (input.direction === "out") {
    const company = await assertCompanyProfileReady();
    if (!company.ok) return { ok: false as const, error: company.error };
  }
  const doc = await saveExtractedDocument({
    ...input,
    lines: input.lines.map((l) => ({
      label: l.label,
      qty: l.qty,
      unit: l.unit,
      buy_price: l.buy_price,
      sell_price:
        l.sell_price ??
        (input.direction === "out" ? l.buy_price : 0),
    })),
    extract: {
      confirmed: true,
      totals: input.totals ?? null,
      lines: input.lines,
      file_sha256: input.fileSha256 || null,
      document_number: input.documentNumber || null,
      issue_date: input.issueDate || null,
      party_address: input.partyAddress || null,
      contact_name: input.contactName || null,
      contact_email: input.contactEmail || null,
      contact_phone: input.contactPhone || null,
      delivery_date: input.deliveryDate || null,
      raw_model: input.rawExtract ?? null,
      vendor_key: input.agentMeta?.vendor_key ?? null,
      profile_version: input.agentMeta?.profile_version ?? null,
      read_recap: input.readRecap ?? null,
    },
  }).catch((err: unknown) => {
    console.error("[metier] confirmDocument", err);
    return null;
  });
  if (!doc) return { ok: false as const, error: "Le document n’a pas pu être enregistré." };
  const deliveryDay =
    typeof input.deliveryDate === "string" && /^\d{4}-\d{2}-\d{2}$/.test(input.deliveryDate.trim())
      ? input.deliveryDate.trim()
      : null;
  if (deliveryDay) {
    try {
      const { addCalendarEvent } = await import("@/app/(app)/accueil/actions");
      const { formatDeliveryDateFr } = await import("@/lib/metier/delivery");
      const chantierLabel = doc.chantier_name?.trim() || null;
      const titleBits = [
        "Livraison",
        chantierLabel ? `chantier ${chantierLabel}` : null,
        input.partyName?.trim() || null,
        input.documentNumber ? `n° ${input.documentNumber}` : input.title?.trim() || null,
        formatDeliveryDateFr(deliveryDay),
      ].filter(Boolean);
      await addCalendarEvent({
        title: titleBits.join(" · ").slice(0, 120),
        startsAt: `${deliveryDay}T12:00:00.000Z`,
        allDay: true,
        day: deliveryDay,
      });
    } catch (err) {
      console.error("[confirmDocument] calendar delivery", err);
    }
  }
  try {
    await learnFromConfirmation({
      vendorKey: input.agentMeta?.vendor_key ?? "unknown",
      rawExtract: input.rawExtract,
      confirmed: {
        kind: input.kind,
        direction: input.direction,
        partyKind: input.partyKind,
        totals: input.totals,
        lines: input.lines,
      },
    });
  } catch (err) {
    console.error("[confirmDocument] learnFromConfirmation", err);
  }
  await recordPriceAlerts(doc);
  try {
    const rises = doc.direction === "in" ? 1 : 0;
    const { notifyDocumentAnalyzed, notifySiteActivity, notifyInvoiceAnomaly } = await import(
      "@/lib/notifications/emitters"
    );
    await notifyDocumentAnalyzed(doc, rises);
    if (doc.chantier_id && doc.chantier_slug && doc.direction === "in") {
      await notifySiteActivity({
        chantierId: doc.chantier_id,
        chantierSlug: doc.chantier_slug,
        chantierName: doc.chantier_name || "Chantier",
        message: `Une nouvelle ${doc.kind === "facture" ? "facture" : "pièce"} fournisseur vient d’être associée au chantier.`,
        documentId: doc.id,
      });
    }
    // Anomalies facture : prix > dernier achat (même logique que hausses, message explicite)
    if (doc.kind === "facture" && doc.direction === "in") {
      const { listDocuments } = await import("@/lib/metier/queries");
      const others = (await listDocuments({ direction: "in" })).filter((d) => d.id !== doc.id);
      const reasons: string[] = [];
      for (const line of doc.lines) {
        const prev = others
          .flatMap((d) => d.lines.map((l) => ({ l, d })))
          .filter((x) => x.l.label.toLowerCase() === line.label.toLowerCase())
          .sort((a, b) => b.d.created_at.localeCompare(a.d.created_at))[0];
        if (!prev) continue;
        const oldP = Number(prev.l.buy_price);
        const newP = Number(line.buy_price);
        if (oldP > 0 && newP > oldP) {
          const pct = ((newP - oldP) / oldP) * 100;
          reasons.push(
            `${line.label} : prix supérieur au dernier achat (+${pct.toFixed(1)} %).`,
          );
        }
      }
      if (reasons.length) {
        await notifyInvoiceAnomaly({
          documentId: doc.id,
          partyName: doc.party_name,
          reasons: [
            `${reasons.length} ligne${reasons.length > 1 ? "s présentent" : " présente"} un prix supérieur au dernier achat enregistré.`,
            ...reasons.slice(0, 2),
          ],
        });
      }
    }
  } catch (err) {
    console.error("[confirmDocument] notifications", err);
  }
  try {
    const { track } = await import("@/lib/analytics/track");
    const dbUser = await getDb();
    void track({
      name: "document_confirmed",
      userId: dbUser?.user.id ?? null,
      feature: "analyses",
      path: "/devis/analyser",
      properties: { kind: doc.kind, direction: doc.direction, documentId: doc.id },
    });
  } catch {
    /* analytics best-effort */
  }
  refresh();
  return {
    ok: true as const,
    id: doc.id,
    chantierId: doc.chantier_id,
    chantierSlug: doc.chantier_slug,
    direction: doc.direction,
    kind: doc.kind,
  };
}

export async function createPartyAction(form: FormData) {
  const name = String(form.get("name") ?? "").trim();
  const kindRaw = String(form.get("kind") ?? "distributeur");
  const kind = kindRaw === "fournisseur" ? "fournisseur" : "distributeur";
  const res = await createParty({
    name,
    kind,
    address: String(form.get("address") ?? ""),
    website: String(form.get("website") ?? ""),
  });
  if (!res.ok) return res;
  refresh();
  return { ok: true as const };
}

export async function createPartyFormAction(form: FormData) {
  await createPartyAction(form);
}

export async function createChantierAction(form: FormData) {
  const name = String(form.get("name") ?? "").trim();
  if (!name) return { ok: false as const, error: "Nom manquant." };
  try {
    const c = await createChantier({
      name,
      address: String(form.get("address") ?? ""),
      clientName: String(form.get("client") ?? ""),
    });
    refresh();
    return { ok: true as const, id: c.id, slug: c.slug };
  } catch (err) {
    console.error("[metier] createChantierAction", err);
    return { ok: false as const, error: "Impossible de créer le chantier." };
  }
}

/** Crée un chantier (depuis le document) et y rattache la pièce. */
export async function createChantierForDocumentAction(documentId: string) {
  const doc = await getDocument(documentId);
  if (!doc) return { ok: false as const, error: "Pièce introuvable." };
  if (doc.chantier_id && doc.chantier_slug) {
    return {
      ok: true as const,
      id: doc.chantier_id,
      slug: doc.chantier_slug,
      reused: true as const,
    };
  }

  const extract = (doc.extract ?? {}) as Record<string, unknown>;
  const raw = extract.raw_model as { chantier_hint?: string } | null | undefined;
  const hint = String(raw?.chantier_hint ?? "").trim();
  const name =
    hint ||
    doc.chantier_name?.trim() ||
    [doc.party_name, KIND_LABEL[doc.kind]].filter(Boolean).join(" — ") ||
    doc.title;
  const address = hint || doc.party_address || "";
  const clientName =
    doc.direction === "out" && doc.party_kind === "client" ? doc.party_name || "" : "";

  try {
    const c = await createChantier({
      name: name.slice(0, 120),
      address: address.slice(0, 200),
      clientName: clientName || undefined,
    });
    const linked = await updateDocument({ id: doc.id, chantierId: c.id });
    if (!linked.ok) {
      return { ok: false as const, error: linked.error ?? "Impossible de lier le document." };
    }
    refresh();
    revalidatePath(`/pieces/${doc.id}`);
    revalidatePath(`/chantiers/${c.slug}`);
    return { ok: true as const, id: c.id, slug: c.slug, reused: false as const };
  } catch (err) {
    console.error("[metier] createChantierForDocumentAction", err);
    return { ok: false as const, error: "Impossible de créer le chantier." };
  }
}

export async function setChantierStatusAction(id: string, status: ChantierStatus) {
  await setChantierStatus(id, status);
  refresh();
}

export async function deleteChantierAction(id: string) {
  const res = await deleteChantier(id);
  if (!res.ok) return res;
  refresh();
  return { ok: true as const };
}

export async function saveDocumentAction(form: FormData) {
  const id = String(form.get("documentId") ?? "");
  if (!id) return { ok: false as const, error: "Pièce manquante." };
  const title = String(form.get("title") ?? "");
  const partyId = String(form.get("partyId") || "") || null;
  const chantierId = String(form.get("chantierId") || "") || null;
  const partyName = String(form.get("partyName") ?? "").trim();
  const ids = form.getAll("lineId").map(String);
  const lines = ids.map((lineId, i) => ({
    id: lineId,
    label: String(form.getAll("lineLabel")[i] ?? ""),
    qty: Number(form.getAll("lineQty")[i]),
    buy_price: Number(form.getAll("lineBuy")[i]),
    sell_price: Number(form.getAll("lineSell")[i]),
  }));
  const res = await updateDocument({ id, title, partyId, chantierId, partyName, lines });
  if (!res.ok) return res;
  refresh();
  revalidatePath(`/pieces/${id}`);
  return { ok: true as const };
}

export async function transformQuoteAction(form: FormData) {
  const sourceId = String(form.get("sourceId") ?? "");
  const kindRaw = String(form.get("kind") ?? "devis") as ClientOutKind;
  const kind = CLIENT_OUT_KINDS.includes(kindRaw) ? kindRaw : "devis";
  const marginRaw = form.get("margin");
  const defaultMarkup = kind === "bon_enlevement" ? 1 : 1.35;
  const fromMargin = marginRaw != null && String(marginRaw) !== "" ? marginToMarkup(Number(marginRaw)) : null;
  const markup = fromMargin ?? Number(form.get("markup") ?? defaultMarkup);
  const clientId = String(form.get("clientId") ?? "") || null;
  if (!sourceId) return { ok: false as const, error: "Document source manquant." };
  const src = await getDocument(sourceId);
  if (!src) return { ok: false as const, error: "Document source manquant." };
  try {
    if (src.direction === "out") {
      const fromDevis = src.kind === "devis" && CLIENT_DEVIS_NEXT_KINDS.includes(kind as (typeof CLIENT_DEVIS_NEXT_KINDS)[number]);
      const fromCommande = src.kind === "bon_commande" && kind === "facture";
      if (!fromDevis && !fromCommande) {
        return { ok: false as const, error: "Choisissez une commande ou une facture client." };
      }
      const doc = await transformImportedDocument(sourceId, 1, clientId || src.party_id, kind, true);
      if (!doc) return { ok: false as const, error: "Transformation impossible." };
      refresh();
      return { ok: true as const, id: doc.id, kind: doc.kind };
    }
    const company = await assertCompanyProfileReady();
    if (!company.ok) return { ok: false as const, error: company.error };
    const doc = await transformImportedDocument(sourceId, markup > 0 ? markup : defaultMarkup, clientId, kind);
    if (!doc) return { ok: false as const, error: "Transformation impossible." };
    if (doc.direction === "out" && doc.kind === "devis") {
      const { evaluateMarginBelowTarget } = await import("@/lib/automation/margin");
      await evaluateMarginBelowTarget(doc.id).catch((err) => console.error("[metier] margin", err));
    }
    refresh();
    return { ok: true as const, id: doc.id, kind: doc.kind };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Transformation impossible.";
    console.error("[metier] transformQuoteAction", err);
    try {
      const { track } = await import("@/lib/analytics/track");
      const dbUser = await getDb();
      void track({
        name: "document_transform_failed",
        userId: dbUser?.user.id ?? null,
        feature: "analyses",
        path: "/devis/analyser",
        properties: { sourceId, kind, error: message.slice(0, 200) },
      });
    } catch {
      /* analytics best-effort */
    }
    return { ok: false as const, error: message };
  }
}

export async function draftDocumentMailAction(documentId: string) {
  const doc = await getDocument(documentId);
  if (!doc) return { ok: false as const, error: "Pièce introuvable." };
  const draft = await draftDocumentMail(doc);
  const { isResendSendEnabled } = await import("@/lib/email/send");
  return { ok: true as const, ...draft, canSendEmail: isResendSendEnabled() };
}

export async function sendDocumentAction(form: FormData) {
  const id = String(form.get("documentId") ?? "");
  const to = String(form.get("to") ?? "").trim();
  const note = String(form.get("note") ?? "").trim();
  const subjectIn = String(form.get("subject") ?? "").trim();
  if (!id) return { ok: false as const, error: "Document manquant." };
  if (!to.includes("@")) return { ok: false as const, error: "E-mail invalide." };
  const doc = await getDocument(id);
  if (!doc) return { ok: false as const, error: "Pièce introuvable." };
  const draft = await draftDocumentMail(doc);
  const res = await sendDocumentMail({
    documentId: id,
    to,
    subject: subjectIn || draft.subject,
    body: note || draft.body,
  });
  if (!res.ok) return res;
  refresh();
  return { ok: true as const };
}

export async function sendFollowUpNowAction(form: FormData) {
  const id = String(form.get("documentId") ?? "");
  const to = String(form.get("to") ?? "").trim();
  const note = String(form.get("note") ?? "").trim();
  const subject = String(form.get("subject") ?? "").trim();
  const followUpId = String(form.get("followUpId") ?? "");
  if (!id) return { ok: false as const, error: "Document manquant." };
  if (!to.includes("@")) return { ok: false as const, error: "E-mail invalide." };
  const all = await listDocuments();
  const doc = all.find((d) => d.id === id);
  if (!doc) return { ok: false as const, error: "Pièce introuvable." };
  if (doc.status !== "ready") return { ok: false as const, error: "Document invalide." };
  if (isDocumentTransformed(doc, all)) {
    return { ok: false as const, error: "Ce document a déjà une suite. Relance non envoyée." };
  }
  const gate = followUpStillEligible(doc, all, {
    id: followUpId || "tmp",
    document_id: doc.id,
    chantier_id: doc.chantier_id,
    audience: doc.direction === "out" ? "client" : "fournisseur",
    status: "due",
    scheduled_at: null,
    last_action_at: null,
    sent_at: null,
    to_email: to,
    subject,
    body: note,
    created_at: doc.created_at,
  });
  if (!gate.ok) {
    const msg =
      gate.reason === "email-missing"
        ? "E-mail invalide."
        : gate.reason === "transformed"
          ? "Ce document a déjà une suite. Relance non envoyée."
          : "Relance impossible.";
    return { ok: false as const, error: msg };
  }
  const mail = await sendDocumentMail({ documentId: id, to, subject, body: note });
  if (!mail.ok) return mail;
  const saved = await upsertFollowUp({
    id: followUpId && !followUpId.startsWith("virtual:") ? followUpId : undefined,
    documentId: id,
    status: "sent",
    toEmail: to,
    subject,
    body: note,
  });
  if (!saved.ok) return saved;
  refresh();
  return { ok: true as const };
}

/** Marque la relance envoyée après ouverture du client mail (mailto) — pas d’envoi Resend. */
export async function recordFollowUpSentExternalAction(form: FormData) {
  const id = String(form.get("documentId") ?? "");
  const to = String(form.get("to") ?? "").trim();
  const note = String(form.get("note") ?? "").trim();
  const subject = String(form.get("subject") ?? "").trim();
  const followUpId = String(form.get("followUpId") ?? "");
  if (!id) return { ok: false as const, error: "Document manquant." };
  if (!to.includes("@")) return { ok: false as const, error: "E-mail invalide." };
  const all = await listDocuments();
  const doc = all.find((d) => d.id === id);
  if (!doc) return { ok: false as const, error: "Pièce introuvable." };
  if (isDocumentTransformed(doc, all)) {
    return { ok: false as const, error: "Ce document a déjà une suite. Relance non enregistrée." };
  }
  const saved = await upsertFollowUp({
    id: followUpId && !followUpId.startsWith("virtual:") ? followUpId : undefined,
    documentId: id,
    status: "sent",
    toEmail: to,
    subject,
    body: note,
  });
  if (!saved.ok) return saved;
  await markDocumentSent(doc.id, { last_sent_to: to });
  refresh();
  return { ok: true as const };
}

export async function scheduleFollowUpAction(form: FormData) {
  const days = Number(form.get("days") ?? 3);
  const followUpId = String(form.get("followUpId") ?? "");
  const res = await scheduleFollowUpForDocument({
    documentId: String(form.get("documentId") ?? ""),
    to: String(form.get("to") ?? "").trim(),
    subject: String(form.get("subject") ?? "").trim(),
    body: String(form.get("note") ?? "").trim(),
    days: days === 1 || days === 7 ? days : 3,
    id: followUpId && !followUpId.startsWith("virtual:") ? followUpId : undefined,
  });
  if (!res.ok) return res;
  refresh();
  return { ok: true as const };
}

export async function markFollowUpStatusAction(id: string, status: FollowUpStatus) {
  const res = await setFollowUpStatus(id, status);
  if (!res.ok) return res;
  refresh();
  return { ok: true as const };
}

export async function createDevisFromSavedProductAction(input: {
  name: string;
  unitPriceHT: number | null;
}) {
  const label = input.name.trim();
  if (!label) return { ok: false as const, error: "Produit manquant." };
  const { draftFromSystemTemplate, getSystemTemplate } = await import("@/lib/metier/devis-templates");
  const tpl = getSystemTemplate("blank");
  if (!tpl) return { ok: false as const, error: "Modèle indisponible." };
  const price = input.unitPriceHT != null && Number.isFinite(input.unitPriceHT) ? input.unitPriceHT : 0;
  const draft = draftFromSystemTemplate(tpl, {
    idempotencyKey: `product:${label}:${Date.now()}`,
  });
  draft.lines.push({
    description: label,
    quantity: 1,
    unit: "u",
    unitPriceHT: price,
    vatRate: 20,
    missing: price <= 0 ? ["prix"] : undefined,
  });
  if (price <= 0) {
    draft.warnings = ["Prix à renseigner sur une ou plusieurs lignes."];
  }
  const { persistDevisDraft } = await import("@/lib/metier/devis/persist");
  const result = await persistDevisDraft(draft);
  if (!result.ok) return { ok: false as const, error: result.error };
  refresh();
  return { ok: true as const, id: result.id, reused: result.reused };
}

export async function createFromTemplateAction(form: FormData) {
  const templateId = String(form.get("templateId") ?? "");
  const { draftFromSystemTemplate, getSystemTemplate } = await import("@/lib/metier/devis-templates");
  const tpl = getSystemTemplate(templateId);
  if (!tpl) return { ok: false as const, error: "Modèle inconnu." };
  const chantierId = String(form.get("chantierId") || "") || null;
  const clientId = String(form.get("clientId") || "") || null;
  const idempotencyKey = String(form.get("idempotencyKey") || "").trim() || undefined;
  const clients = await listParties("client");
  const chantiers = await listChantiers();
  const client = clientId ? clients.find((c) => c.id === clientId) : null;
  const chantier = chantierId ? chantiers.find((c) => c.id === chantierId) : null;
  const draft = draftFromSystemTemplate(tpl, {
    clientId: client?.id ?? null,
    clientName: client?.name ?? "Client",
    chantierId: chantier?.id ?? null,
    chantierName: chantier?.name ?? null,
    idempotencyKey,
  });
  const { persistDevisDraft } = await import("@/lib/metier/devis/persist");
  const result = await persistDevisDraft(draft);
  if (!result.ok) return { ok: false as const, error: result.error };
  refresh();
  return { ok: true as const, id: result.id, reused: result.reused };
}

export async function addDocumentLineAction(documentId: string) {
  const res = await addDocumentLine(documentId);
  if (!res.ok) return res;
  refresh();
  return { ok: true as const };
}

export async function saveAccountingExportScheduleAction(input: {
  id?: string;
  enabled: boolean;
  frequency: "monthly" | "quarterly" | "yearly";
  dayOfMonth: number;
  invoiceKinds: ("distributor" | "client")[];
  distributorNames: string[];
  emailTo: string | null;
}) {
  const { upsertAccountingExportSchedule } = await import("@/lib/metier/accounting-export-queries");
  const res = await upsertAccountingExportSchedule(input);
  if (res.ok) refresh();
  return res;
}

export async function deleteAccountingExportScheduleAction(id: string) {
  const { deleteAccountingExportSchedule } = await import("@/lib/metier/accounting-export-queries");
  const res = await deleteAccountingExportSchedule(id);
  if (res.ok) refresh();
  return res;
}

export async function toggleAccountingExportScheduleAction(id: string, enabled: boolean) {
  const { toggleAccountingExportSchedule } = await import("@/lib/metier/accounting-export-queries");
  const res = await toggleAccountingExportSchedule(id, enabled);
  if (res.ok) refresh();
  return res;
}

export async function runAccountingExportNowAction(input: {
  periodStart: string;
  periodEnd: string;
  invoiceKinds: ("distributor" | "client")[];
  distributorNames: string[];
  emailTo?: string | null;
}) {
  const { runManualAccountingExport } = await import("@/lib/metier/accounting-export-queries");
  const res = await runManualAccountingExport(input);
  if (res.ok) refresh();
  return res;
}

export async function getAccountingExportDownloadUrlAction(runId: string) {
  const { getAccountingExportDownloadUrl } = await import("@/lib/metier/accounting-export-queries");
  return getAccountingExportDownloadUrl(runId);
}
