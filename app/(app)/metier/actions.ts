"use server";

import { revalidatePath } from "next/cache";
import { getDb } from "@/lib/db";
import { extractDocument } from "@/lib/metier/extract";
import {
  addDocumentLine,
  createChantier,
  createParty,
  getDocument,
  listDocuments,
  listParties,
  recordPriceAlerts,
  saveExtractedDocument,
  setChantierStatus,
  transformImportedDocument,
  updateDocument,
} from "@/lib/metier/queries";
import { DEVIS_TEMPLATES } from "@/lib/metier/devis-templates";
import {
  scheduleFollowUpForDocument,
  sendDocumentMail,
  setFollowUpStatus,
  upsertFollowUp,
} from "@/lib/metier/follow-up-queries";
import { followUpStillEligible, isDocumentTransformed, type FollowUpStatus } from "@/lib/metier/follow-ups";
import type { ChantierStatus, ClientOutKind, DocDirection, DocKind, ExtractTotals, PartyKind } from "@/lib/metier/types";
import { draftDocumentMail } from "@/lib/metier/draft-mail";
import { CLIENT_DEVIS_NEXT_KINDS, CLIENT_OUT_KINDS, marginToMarkup } from "@/lib/metier/types";

function refresh() {
  for (const p of [
    "/accueil",
    "/copilote",
    "/distributeur",
    "/hausses",
    "/achats",
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
    const extracted = await extractDocument({
      fileName: file.name,
      mime: file.type || "application/octet-stream",
      base64: buf.toString("base64"),
    });
    return { ok: true as const, extracted, filePath, fileName: file.name, fileSha256 };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Extraction impossible.";
    return { ok: false as const, error: message };
  }
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
  lines: Array<{
    label: string;
    qty: number;
    unit: string;
    buy_price: number;
    eco_contribution?: number | null;
    pmcb?: number | null;
    weight_kg?: number | null;
  }>;
}) {
  const doc = await saveExtractedDocument({
    ...input,
    extract: {
      confirmed: true,
      totals: input.totals ?? null,
      lines: input.lines,
      file_sha256: input.fileSha256 || null,
    },
  }).catch((err: unknown) => {
    console.error("[metier] confirmDocument", err);
    return null;
  });
  if (!doc) return { ok: false as const, error: "Le document n’a pas pu être enregistré." };
  await recordPriceAlerts(doc);
  refresh();
  return { ok: true as const, id: doc.id };
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
    return { ok: true as const, slug: c.slug };
  } catch (err) {
    console.error("[metier] createChantierAction", err);
    return { ok: false as const, error: "Impossible de créer le chantier." };
  }
}

export async function setChantierStatusAction(id: string, status: ChantierStatus) {
  await setChantierStatus(id, status);
  refresh();
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
    const doc = await transformImportedDocument(sourceId, markup > 0 ? markup : defaultMarkup, clientId, kind);
    if (!doc) return { ok: false as const, error: "Transformation impossible." };
    refresh();
    return { ok: true as const, id: doc.id, kind: doc.kind };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Transformation impossible.";
    console.error("[metier] transformQuoteAction", err);
    return { ok: false as const, error: message };
  }
}

export async function draftDocumentMailAction(documentId: string) {
  const doc = await getDocument(documentId);
  if (!doc) return { ok: false as const, error: "Pièce introuvable." };
  const draft = await draftDocumentMail(doc);
  return { ok: true as const, ...draft };
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

export async function createFromTemplateAction(form: FormData) {
  const templateId = String(form.get("templateId") ?? "");
  const tpl = DEVIS_TEMPLATES.find((t) => t.id === templateId);
  if (!tpl) return { ok: false as const, error: "Modèle inconnu." };
  const chantierId = String(form.get("chantierId") || "") || null;
  const clientId = String(form.get("clientId") || "");
  const clients = await listParties("client");
  const client = clients.find((c) => c.id === clientId);
  const doc = await saveExtractedDocument({
    title: tpl.id === "vide" ? "Devis" : `Devis — ${tpl.title}`,
    direction: "out",
    kind: "devis",
    partyName: client?.name || "Client",
    partyKind: "client",
    chantierId,
    extract: { source: "template", templateId },
    lines: tpl.lines.map((l) => ({
      label: l.label,
      qty: l.qty,
      unit: l.unit,
      buy_price: 0,
      sell_price: l.sell,
    })),
  }).catch((err: unknown) => {
    console.error("[metier] createFromTemplateAction", err);
    return null;
  });
  if (!doc) return { ok: false as const, error: "Le devis n’a pas pu être créé." };
  refresh();
  return { ok: true as const, id: doc.id };
}

export async function addDocumentLineAction(documentId: string) {
  const res = await addDocumentLine(documentId);
  if (!res.ok) return res;
  refresh();
  return { ok: true as const };
}
