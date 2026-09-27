"use server";

import { revalidatePath } from "next/cache";
import { getDb } from "@/lib/db";
import { extractDocument } from "@/lib/metier/extract";
import {
  createChantier,
  createParty,
  getDocument,
  recordPriceAlerts,
  saveExtractedDocument,
  setChantierStatus,
  transformImportedDocument,
} from "@/lib/metier/queries";
import type { ChantierStatus, ClientOutKind, DocDirection, DocKind, ExtractTotals, PartyKind } from "@/lib/metier/types";
import { sendEmailWithPdf } from "@/lib/email/send";
import { pdfFromDocument } from "@/lib/metier/pdf/from-document";
import { getViewer } from "@/lib/session";
import { CLIENT_OUT_KINDS, KIND_LABEL, marginToMarkup } from "@/lib/metier/types";

function refresh() {
  for (const p of ["/accueil", "/copilote", "/ressources", "/schemas", "/anatomie", "/projets", "/composants", "/outils", "/audit"]) {
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

export async function sendDocumentAction(form: FormData) {
  const id = String(form.get("documentId") ?? "");
  const to = String(form.get("to") ?? "").trim();
  const note = String(form.get("note") ?? "").trim();
  if (!id) return { ok: false as const, error: "Document manquant." };
  if (!to.includes("@")) return { ok: false as const, error: "E-mail client invalide." };
  const [doc, viewer] = await Promise.all([getDocument(id), getViewer()]);
  if (!doc || doc.direction !== "out") return { ok: false as const, error: "Pièce introuvable." };
  const { buffer, filename } = await pdfFromDocument(doc, viewer?.email);
  const label = KIND_LABEL[doc.kind].toLowerCase();
  const res = await sendEmailWithPdf({
    to,
    subject: `${KIND_LABEL[doc.kind]} — ${doc.title}`,
    text:
      note ||
      `Bonjour,\n\nVeuillez trouver ci-joint ${label} « ${doc.title} ».\n\nCordialement`,
    filename,
    pdf: buffer,
    replyTo: viewer?.email,
  });
  if (!res.ok) return { ok: false as const, error: res.error ?? "Envoi impossible." };
  refresh();
  return { ok: true as const };
}
