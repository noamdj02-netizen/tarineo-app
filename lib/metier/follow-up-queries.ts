import "server-only";
import { getDb } from "@/lib/db";
import {
  documentSentAt,
  followUpAudience,
  followUpStillEligible,
  isDocumentTransformed,
  scheduleAtNine,
  type FollowUp,
  type FollowUpStatus,
} from "@/lib/metier/follow-ups";
import {
  getMem,
  memListFollowUps,
  memMergeExtract,
  memUpdateFollowUp,
  memUpsertFollowUp,
} from "@/lib/metier/memory";
import { getDocument, listDocuments } from "@/lib/metier/queries";
import { createAdminClient } from "@/lib/supabase/admin";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import type { DocumentCard } from "@/lib/metier/types";
import { COMPANY_LOGO_CID, companyLogoFromBuffer, loadCompanyLogo } from "@/lib/metier/brand-assets";
import { pieceMailHtml } from "@/lib/metier/draft-mail";
import { pdfFromDocument } from "@/lib/metier/pdf/from-document";
import { sendEmailWithPdf, type InlineMailImage } from "@/lib/email/send";
import { getViewer } from "@/lib/session";
import { getCompanyProfile } from "@/lib/metier/queries";
import { getCompanyProfileForUser, listDocumentsForUser } from "@/lib/metier/documents-for-user";
import { tryInsertAutomationExecution } from "@/lib/automation/executions";
import { quoteFollowupSendKey } from "@/lib/automation/types";
import { getNotificationPreferencesForUser } from "@/lib/settings/notification-store";

function allowLocalMemory() {
  return process.env.NODE_ENV !== "production" && process.env.VERCEL_ENV !== "preview" && process.env.VERCEL_ENV !== "production";
}

function isMissingTable(error: { message?: string; code?: string } | null) {
  const m = error?.message ?? "";
  return /does not exist|schema cache|Could not find the table/i.test(m);
}

function uid() {
  return crypto.randomUUID();
}

export async function listStoredFollowUps(): Promise<FollowUp[]> {
  const db = await getDb();
  if (!db) {
    if (!allowLocalMemory()) return [];
    return memListFollowUps("local");
  }
  const { data, error } = await db.supabase
    .from("follow_ups")
    .select(
      "id, document_id, chantier_id, audience, status, scheduled_at, last_action_at, sent_at, to_email, subject, body, created_at",
    )
    .eq("user_id", db.user.id)
    .order("created_at", { ascending: false });
  if (error) {
    if (isMissingTable(error) && allowLocalMemory()) return memListFollowUps(db.user.id);
    console.error("[metier] listStoredFollowUps", error);
    return [];
  }
  return (data ?? []).map((row) => ({
    ...(row as FollowUp),
    sequence_number: (row as { sequence_number?: number }).sequence_number ?? 1,
  }));
}

export async function markDocumentSent(documentId: string, extra?: Record<string, unknown>) {
  const patch = { sent_at: new Date().toISOString(), ...extra };
  const db = await getDb();
  if (!db) {
    if (!allowLocalMemory()) return;
    memMergeExtract("local", documentId, patch);
    return;
  }
  const { data } = await db.supabase
    .from("documents")
    .select("extract")
    .eq("id", documentId)
    .eq("user_id", db.user.id)
    .maybeSingle();
  if (!data) return;
  const prev = (data.extract && typeof data.extract === "object" ? data.extract : {}) as Record<string, unknown>;
  await db.supabase
    .from("documents")
    .update({ extract: { ...prev, ...patch } })
    .eq("id", documentId)
    .eq("user_id", db.user.id);
}

export async function upsertFollowUp(input: {
  id?: string;
  documentId: string;
  status: FollowUpStatus;
  scheduledAt?: string | null;
  toEmail: string;
  subject: string;
  body: string;
  sequenceNumber?: number;
}): Promise<{ ok: true; followUp: FollowUp } | { ok: false; error: string }> {
  const doc = await getDocument(input.documentId);
  if (!doc) return { ok: false, error: "Pièce introuvable." };
  const now = new Date().toISOString();
  const row: FollowUp = {
    id: input.id && !input.id.startsWith("virtual:") ? input.id : uid(),
    document_id: doc.id,
    chantier_id: doc.chantier_id,
    audience: followUpAudience(doc),
    status: input.status,
    scheduled_at: input.scheduledAt ?? null,
    last_action_at: now,
    sent_at: input.status === "sent" ? now : null,
    to_email: input.toEmail,
    subject: input.subject,
    body: input.body,
    created_at: now,
    sequence_number: input.sequenceNumber ?? 1,
  };

  const db = await getDb();
  if (!db) {
    if (!allowLocalMemory()) return { ok: false, error: "Enregistrement impossible." };
    memUpsertFollowUp("local", row);
    return { ok: true, followUp: row };
  }

  const payload = {
    id: row.id,
    user_id: db.user.id,
    document_id: row.document_id,
    chantier_id: row.chantier_id,
    audience: row.audience,
    status: row.status,
    scheduled_at: row.scheduled_at,
    last_action_at: row.last_action_at,
    sent_at: row.sent_at,
    to_email: row.to_email,
    subject: row.subject,
    body: row.body,
    sequence_number: row.sequence_number ?? 1,
  };
  const { error } = await db.supabase.from("follow_ups").upsert(payload as never);
  if (error) {
    if (isMissingTable(error) && allowLocalMemory()) {
      memUpsertFollowUp(db.user.id, row);
      return { ok: true, followUp: row };
    }
    console.error("[metier] upsertFollowUp", error);
    return { ok: false, error: "Relance non enregistrée." };
  }
  return { ok: true, followUp: row };
}

export async function setFollowUpStatus(id: string, status: FollowUpStatus) {
  if (id.startsWith("virtual:")) return { ok: false as const, error: "Relance non enregistrée." };
  const db = await getDb();
  const now = new Date().toISOString();
  if (!db) {
    if (!allowLocalMemory()) return { ok: false as const, error: "Enregistrement impossible." };
    const row = memUpdateFollowUp("local", id, { status, last_action_at: now });
    return row ? { ok: true as const } : { ok: false as const, error: "Relance introuvable." };
  }
  const { error } = await db.supabase
    .from("follow_ups")
    .update({ status, last_action_at: now })
    .eq("id", id)
    .eq("user_id", db.user.id);
  if (error) {
    if (isMissingTable(error) && allowLocalMemory()) {
      memUpdateFollowUp(db.user.id, id, { status, last_action_at: now });
      return { ok: true as const };
    }
    return { ok: false as const, error: "Mise à jour impossible." };
  }
  return { ok: true as const };
}

export async function sendDocumentMail(input: {
  documentId: string;
  to: string;
  subject: string;
  body: string;
}): Promise<{ ok: true } | { ok: false; error: string }> {
  const [doc, viewer, company, logo] = await Promise.all([
    getDocument(input.documentId),
    getViewer(),
    getCompanyProfile(),
    loadCompanyLogo(),
  ]);
  if (!doc) return { ok: false, error: "Pièce introuvable." };
  const { buffer, filename } = await pdfFromDocument(doc, viewer?.email);
  const { getCompanyMailIdentity } = await import("@/lib/metier/company-mail-identity");
  const identity = await getCompanyMailIdentity();
  const bodyAlreadySigned =
    Boolean(identity.signOff) && input.body.includes(identity.signOff.slice(0, 24));
  const remoteLogo = identity.logoFromEmailUrl.startsWith("http") ? identity.logoFromEmailUrl : "";
  const inline: InlineMailImage[] | undefined = logo
    ? [
        {
          filename: logo.filename,
          content: logo.buffer,
          contentId: logo.cid,
          contentType: logo.mime,
        },
      ]
    : remoteLogo
      ? [
          {
            filename: "logo.png",
            path: remoteLogo,
            contentId: COMPANY_LOGO_CID,
          },
        ]
      : undefined;
  const html = pieceMailHtml({
    body: input.body,
    company: identity.companyName || company?.raison_sociale || "L’entreprise",
    phone: identity.phone || company?.telephone,
    email: identity.email || company?.email_contact || viewer?.email || undefined,
    address: identity.address || [company?.adresse_rue, company?.adresse_code_postal, company?.adresse_ville].filter(Boolean).join(", "),
    logoCid: logo || remoteLogo ? COMPANY_LOGO_CID : undefined,
    // Si le body contient déjà la signature (brouillon IA), ne pas la dupliquer en pied HTML.
    signatureFooter:
      !bodyAlreadySigned && identity.signatureText ? identity.closingBlock : null,
  });
  const res = await sendEmailWithPdf({
    to: input.to,
    subject: input.subject,
    text: input.body,
    html,
    filename,
    pdf: buffer,
    replyTo: company?.email_contact || viewer?.email,
    inline,
    idempotencyKey: `doc-mail:${input.documentId}:${input.to}`,
  });
  if (!res.ok) {
    return {
      ok: false,
      error: res.skipped
        ? "Envoi Tarinéo indisponible : RESEND_API_KEY manquant, ou RESEND_ENABLE_DEV=true requis en local."
        : (res.error ?? "Envoi impossible."),
    };
  }
  await markDocumentSent(doc.id, { last_sent_to: input.to });
  return { ok: true };
}

export async function scheduleFollowUpForDocument(input: {
  documentId: string;
  to: string;
  subject: string;
  body: string;
  days: number;
  id?: string;
}) {
  const all = await listDocuments();
  const doc = all.find((d) => d.id === input.documentId);
  if (!doc) return { ok: false as const, error: "Pièce introuvable." };
  if (doc.status !== "ready") return { ok: false as const, error: "Document invalide." };
  if (isDocumentTransformed(doc, all)) {
    return { ok: false as const, error: "Ce document a déjà une suite. Relance inutile." };
  }
  if (!input.to.includes("@")) return { ok: false as const, error: "E-mail invalide." };
  if (!documentSentAt(doc.extract)) {
    return { ok: false as const, error: "Envoyez d’abord le document avant de programmer une relance." };
  }
  return upsertFollowUp({
    id: input.id,
    documentId: input.documentId,
    status: "scheduled",
    scheduledAt: scheduleAtNine(input.days),
    toEmail: input.to,
    subject: input.subject,
    body: input.body,
  });
}

export async function processScheduledFollowUps() {
  if (!isSupabaseConfigured()) {
    if (allowLocalMemory()) {
      const u = getMem("local");
      const now = Date.now();
      const docs = await listDocuments();
      let sent = 0;
      for (const fu of [...u.followUps]) {
        if (fu.status !== "scheduled" || !fu.scheduled_at) continue;
        if (Date.parse(fu.scheduled_at) > now) continue;
        if (fu.sent_at) continue;
        try {
          const doc = docs.find((d) => d.id === fu.document_id) ?? null;
          const check = followUpStillEligible(doc, docs, fu, { requirePriorSend: true });
          if (!check.ok) {
            memUpdateFollowUp("local", fu.id, { status: "done", last_action_at: new Date().toISOString() });
            continue;
          }
          const mail = await sendDocumentMail({
            documentId: fu.document_id,
            to: fu.to_email,
            subject: fu.subject,
            body: fu.body,
          });
          if (mail.ok) {
            memUpdateFollowUp("local", fu.id, {
              status: "sent",
              sent_at: new Date().toISOString(),
              last_action_at: new Date().toISOString(),
              attempt_number: (fu.attempt_number ?? 0) + 1,
            });
            sent += 1;
          }
        } catch (err) {
          console.error("[cron] follow-up", fu.id, err);
        }
      }
      return { processed: sent };
    }
    return { processed: 0 };
  }

  const admin = createAdminClient();
  const nowIso = new Date().toISOString();
  const { data, error } = await admin
    .from("follow_ups")
    .select("*")
    .eq("status", "scheduled")
    .is("sent_at", null)
    .lte("scheduled_at", nowIso);
  if (error) {
    if (isMissingTable(error)) return { processed: 0 };
    console.error("[cron] follow_ups", error);
    return { processed: 0, error: error.message };
  }

  let sent = 0;
  let failed = 0;
  let skippedEmailPref = 0;
  for (const raw of data ?? []) {
    const fu = raw as FollowUp & { user_id: string; attempt_number?: number };
    try {
      const claimed = await admin
        .from("follow_ups")
        .update({
          last_action_at: nowIso,
          attempt_number: (fu.attempt_number ?? 0) + 1,
        })
        .eq("id", fu.id)
        .eq("user_id", fu.user_id)
        .eq("status", "scheduled")
        .eq("attempt_number", fu.attempt_number ?? 0)
        .is("sent_at", null)
        .select("id")
        .maybeSingle();
      if (!claimed.data) continue;

      const docs = await listDocumentsForUser(admin, fu.user_id);
      const doc = docs.find((d) => d.id === fu.document_id) ?? null;
      const check = followUpStillEligible(doc, docs, fu, { requirePriorSend: true });
      if (!check.ok) {
        await admin
          .from("follow_ups")
          .update({ status: "done", last_action_at: nowIso })
          .eq("id", fu.id)
          .eq("user_id", fu.user_id);
        continue;
      }

      const prefs = await getNotificationPreferencesForUser(admin, fu.user_id);
      if (!prefs.emailFollowups) {
        skippedEmailPref += 1;
        continue;
      }

      const sendRes = await sendFollowUpAsUser(admin, fu.user_id, doc!, fu);
      if (sendRes.ok) {
        await admin
          .from("follow_ups")
          .update({ status: "sent", sent_at: nowIso, last_action_at: nowIso })
          .eq("id", fu.id)
          .eq("user_id", fu.user_id);
        const prev = (doc!.extract && typeof doc!.extract === "object" ? doc!.extract : {}) as Record<string, unknown>;
        await admin
          .from("documents")
          .update({ extract: { ...prev, sent_at: documentSentAt(doc!.extract) ?? nowIso, last_sent_to: fu.to_email } })
          .eq("id", doc!.id)
          .eq("user_id", fu.user_id);
        sent += 1;
        const seq = fu.sequence_number ?? 1;
        await tryInsertAutomationExecution(admin, {
          userId: fu.user_id,
          slug: "quote_followup",
          phase: "send",
          status: "completed",
          idempotencyKey: quoteFollowupSendKey(doc!.id, seq),
          entityType: "document",
          entityId: doc!.id,
          metadata: { followUpId: fu.id, sequence: seq },
        });
      } else {
        failed += 1;
        const seq = fu.sequence_number ?? 1;
        const errMsg = sendRes.error ?? (sendRes.skipped ? "email-not-configured" : "send-failed");
        console.error("[cron] follow-up send", { followUpId: fu.id, documentId: doc!.id, error: errMsg });
        await tryInsertAutomationExecution(admin, {
          userId: fu.user_id,
          slug: "quote_followup",
          phase: "send",
          status: "failed",
          idempotencyKey: `${quoteFollowupSendKey(doc!.id, seq)}:failed:${nowIso.slice(0, 13)}`,
          entityType: "document",
          entityId: doc!.id,
          error: errMsg,
          metadata: { followUpId: fu.id, sequence: seq, resendSkipped: Boolean(sendRes.skipped) },
        });
      }
    } catch (err) {
      console.error("[cron] follow-up", fu.id, err);
      failed += 1;
    }
  }
  return { processed: sent, failed, skippedEmailPref };
}

type SendPdfResult =
  | { ok: true; skipped?: false; id?: string | null }
  | { ok: false; skipped?: boolean; error?: string };

async function sendFollowUpAsUser(
  admin: ReturnType<typeof createAdminClient>,
  userId: string,
  doc: DocumentCard,
  fu: FollowUp,
): Promise<SendPdfResult> {
  const profile = await getCompanyProfileForUser(admin, userId);
  const { buffer, filename } = await pdfFromDocument(doc, profile?.email_contact, profile);
  const { data: settingsRow } = await admin
    .from("company_profiles")
    .select("settings")
    .eq("user_id", userId)
    .maybeSingle();
  const { parseWorkspaceSettings } = await import("@/lib/settings/workspace-settings");
  const { formatMailClosing } = await import("@/lib/metier/mail-closing");
  const emailSettings = parseWorkspaceSettings(settingsRow?.settings).email;
  const companyName = profile?.raison_sociale || "L’entreprise";
  const closingBlock = formatMailClosing({
    signOff: emailSettings.signOff,
    signatureText: emailSettings.signatureText,
    companyName,
    phone: profile?.telephone,
    email: profile?.email_contact,
  });

  let logo = null as ReturnType<typeof companyLogoFromBuffer>;
  if (profile?.logo_path) {
    const { data: logoBlob, error: logoErr } = await admin.storage.from("documents").download(profile.logo_path);
    if (!logoErr && logoBlob) {
      logo = companyLogoFromBuffer(Buffer.from(await logoBlob.arrayBuffer()), profile.logo_path);
    }
  }
  const remoteLogo = emailSettings.logoFromEmailUrl.trim().startsWith("http")
    ? emailSettings.logoFromEmailUrl.trim()
    : "";
  const inline: InlineMailImage[] | undefined = logo
    ? [
        {
          filename: logo.filename,
          content: logo.buffer,
          contentId: logo.cid,
          contentType: logo.mime,
        },
      ]
    : remoteLogo
      ? [{ filename: "logo.png", path: remoteLogo, contentId: COMPANY_LOGO_CID }]
      : undefined;

  const html = pieceMailHtml({
    body: fu.body,
    company: companyName,
    phone: profile?.telephone,
    email: profile?.email_contact,
    address: [profile?.adresse_rue, profile?.adresse_code_postal, profile?.adresse_ville].filter(Boolean).join(", "),
    logoCid: logo || remoteLogo ? COMPANY_LOGO_CID : undefined,
    signatureFooter: emailSettings.signatureText ? closingBlock : null,
  });
  const seq = fu.sequence_number ?? 1;
  return sendEmailWithPdf({
    to: fu.to_email,
    subject: fu.subject,
    text: fu.body,
    html,
    filename,
    pdf: buffer,
    replyTo: profile?.email_contact,
    inline,
    idempotencyKey: quoteFollowupSendKey(doc.id, seq),
  });
}
