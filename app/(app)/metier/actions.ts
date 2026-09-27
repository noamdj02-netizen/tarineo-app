"use server";

import { revalidatePath } from "next/cache";
import { getDb } from "@/lib/db";
import { extractDocument } from "@/lib/metier/extract";
import {
  createChantier,
  createParty,
  getCompanyProfile,
  getDocument,
  recordPriceAlerts,
  saveExtractedDocument,
  setChantierStatus,
  transformImportedDocument,
  addDocumentLine,
  listParties,
  updateDocument,
} from "@/lib/metier/queries";
import { DEVIS_TEMPLATES } from "@/lib/metier/devis-templates";
import type { ChantierStatus, ClientOutKind, DocDirection, DocKind, ExtractTotals, PartyKind } from "@/lib/metier/types";
import { sendEmailWithPdf } from "@/lib/email/send";
import { loadCompanyLogo } from "@/lib/metier/brand-assets";
import { draftDocumentMail, pieceMailHtml } from "@/lib/metier/draft-mail";
import { pdfFromDocument } from "@/lib/metier/pdf/from-document";
import { getViewer } from "@/lib/session";
import { CLIENT_OUT_KINDS, marginToMarkup } from "@/lib/metier/types";

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
  ]) {
    revalidatePath(p);
  }
}

export async function ingestDocument(form: FormData) {
  const file = form.get("file");
  if (!(file instanceof File) || file.size === 0) return { ok: false as const, error: "Aucun fichier." };
  if (file.size > 12 * 1024 * 1024) return { ok: false as const, error: "Fichier trop lourd (12 Mo max)." };

  const buf = Buffer.from(await file.arrayBuffer());
  const db = await getDb();
  let filePath = "";
  if (db) {
    filePath = `${db.user.id}/${Date.now()}-${file.name.replace(/[^\w.\-]+/g, "_")}`;
    const { error } = await db.supabase.storage.from("documents").upload(filePath, buf, {
      contentType: file.type || "application/octet-stream",
      upsert: false,
    });
    if (error) filePath = "";
  }

  const extracted = await extractDocument({
    fileName: file.name,
    mime: file.type || "application/octet-stream",
    base64: buf.toString("base64"),
  });
  return { ok: true as const, extracted, filePath, fileName: file.name };
}

export async function confirmDocument(input: {
  title: string;
  direction: DocDirection;
  kind: DocKind;
  partyName: string;
  partyKind: PartyKind;
  chantierId: string | null;
  filePath?: string;
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
    extract: { confirmed: true, totals: input.totals ?? null, lines: input.lines },
  });
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
  const c = await createChantier({
    name,
    address: String(form.get("address") ?? ""),
    clientName: String(form.get("client") ?? ""),
  });
  refresh();
  return { ok: true as const, slug: c.slug };
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
  const doc = await transformImportedDocument(sourceId, markup > 0 ? markup : defaultMarkup, clientId, kind);
  if (!doc) return { ok: false as const, error: "Transformation impossible." };
  refresh();
  return { ok: true as const, id: doc.id, kind: doc.kind };
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
  const [doc, viewer, company, logo] = await Promise.all([
    getDocument(id),
    getViewer(),
    getCompanyProfile(),
    loadCompanyLogo(),
  ]);
  if (!doc) return { ok: false as const, error: "Pièce introuvable." };
  const draft = await draftDocumentMail(doc);
  const text = note || draft.body;
  const subject = subjectIn || draft.subject;
  const { buffer, filename } = await pdfFromDocument(doc, viewer?.email);
  const html = pieceMailHtml({
    body: text,
    company: company?.raison_sociale || "L’entreprise",
    phone: company?.telephone,
    email: company?.email_contact || viewer?.email || undefined,
    address: [company?.adresse_rue, company?.adresse_code_postal, company?.adresse_ville].filter(Boolean).join(", "),
    logoCid: logo?.cid,
  });
  const res = await sendEmailWithPdf({
    to,
    subject,
    text,
    html,
    filename,
    pdf: buffer,
    replyTo: company?.email_contact || viewer?.email,
    inline: logo ? [{ filename: logo.filename, content: logo.buffer, contentId: logo.cid }] : undefined,
  });
  if (!res.ok) return { ok: false as const, error: res.error ?? "Envoi impossible." };
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
  });
  refresh();
  return { ok: true as const, id: doc.id };
}

export async function addDocumentLineAction(documentId: string) {
  const res = await addDocumentLine(documentId);
  if (!res.ok) return res;
  refresh();
  return { ok: true as const };
}
