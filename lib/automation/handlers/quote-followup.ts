import "server-only";
import { mergeQuoteFollowupConfig } from "@/lib/automation/config";
import { tryInsertAutomationExecution } from "@/lib/automation/executions";
import { listEnabledQuoteFollowupDefinitions } from "@/lib/automation/queries";
import {
  pickNextQuoteFollowUpSequence,
  quoteFollowUpClosedForDocument,
} from "@/lib/automation/quote-followup-sequence";
import { quoteFollowupScheduleKey, type QuoteFollowupConfig } from "@/lib/automation/types";
import { isMissingAutomationTable } from "@/lib/automation/db";
import { getCompanyProfileForUser, listDocumentsForUser } from "@/lib/metier/documents-for-user";
import { followUpAudience, isDocumentTransformed, type FollowUp } from "@/lib/metier/follow-ups";
import { KIND_LABEL, type DocumentCard } from "@/lib/metier/types";
import { createAdminClient } from "@/lib/supabase/admin";
import { isSupabaseConfigured } from "@/lib/supabase/config";

export { pickNextQuoteFollowUpSequence } from "@/lib/automation/quote-followup-sequence";

export function resolveClientEmail(doc: DocumentCard): string {
  const last = doc.extract?.last_sent_to;
  if (typeof last === "string" && last.includes("@")) return last.trim();
  return "";
}

export function buildAutoFollowUpMail(
  doc: DocumentCard,
  companyName: string,
  sequence: number,
): { subject: string; body: string } {
  const label = KIND_LABEL[doc.kind].toLowerCase();
  const who = doc.party_name || "Madame, Monsieur";
  const chantier = doc.chantier_name ? ` pour le chantier ${doc.chantier_name}` : "";
  const intro =
    sequence > 1
      ? "Sans retour de votre part, nous revenons vers vous concernant"
      : "Nous nous permettons de revenir vers vous concernant";
  const body = `Bonjour ${who},\n\n${intro} ${label} « ${doc.title} »${chantier}.\n\nN’hésitez pas à nous indiquer si vous avez des questions ou si vous souhaitez que nous ajustions notre proposition.\n\nCordialement,\n${companyName}`;
  return {
    subject: `${KIND_LABEL[doc.kind]} — ${doc.chantier_name || doc.title}`,
    body,
  };
}

function isCandidateDoc(doc: DocumentCard, docs: DocumentCard[], config: QuoteFollowupConfig) {
  if (doc.status !== "ready" || doc.error) return false;
  if (isDocumentTransformed(doc, docs)) return false;
  if (config.audience === "client" && doc.direction !== "out") return false;
  if (doc.kind !== "devis" && doc.kind !== "bon_commande") return false;
  if (followUpAudience(doc) !== "client") return false;
  return true;
}

export async function autoScheduleDueQuoteFollowUps(): Promise<{
  scheduled: number;
  skipped: number;
  users: number;
}> {
  if (!isSupabaseConfigured()) return { scheduled: 0, skipped: 0, users: 0 };

  const definitions = await listEnabledQuoteFollowupDefinitions();
  const admin = createAdminClient();
  let scheduled = 0;
  let skipped = 0;

  for (const def of definitions) {
    const config = mergeQuoteFollowupConfig(def.config);
    if (!config.autoScheduleEnabled) continue;

    const userId = def.user_id;
    const [docs, profile] = await Promise.all([
      listDocumentsForUser(admin, userId),
      getCompanyProfileForUser(admin, userId),
    ]);
    const companyName = profile?.raison_sociale?.trim() || "L’entreprise";

    const { data: rawFus, error: fuErr } = await admin
      .from("follow_ups")
      .select("*")
      .eq("user_id", userId);
    if (fuErr) {
      if (!isMissingAutomationTable(fuErr)) console.error("[automation] follow_ups list", fuErr);
      continue;
    }
    const stored = (rawFus ?? []) as FollowUp[];

    for (const doc of docs) {
      if (!isCandidateDoc(doc, docs, config)) continue;
      if (quoteFollowUpClosedForDocument(stored, doc.id)) {
        skipped += 1;
        continue;
      }

      const email = resolveClientEmail(doc);
      if (config.requireValidClientEmail && !email.includes("@")) {
        skipped += 1;
        continue;
      }

      const next = pickNextQuoteFollowUpSequence(doc, stored, config);
      if ("skip" in next) {
        skipped += 1;
        continue;
      }

      const idempotencyKey = quoteFollowupScheduleKey(doc.id, next.seq);
      const claimed = await tryInsertAutomationExecution(admin, {
        userId,
        definitionId: def.id,
        slug: "quote_followup",
        phase: "schedule",
        status: "completed",
        idempotencyKey,
        entityType: "document",
        entityId: doc.id,
        metadata: { sequence: next.seq, skip_reason: null },
      });
      if (!claimed) {
        skipped += 1;
        continue;
      }

      const mail = buildAutoFollowUpMail(doc, companyName, next.seq);
      const now = new Date().toISOString();
      const { error: insErr } = await admin.from("follow_ups").insert({
        user_id: userId,
        document_id: doc.id,
        chantier_id: doc.chantier_id,
        audience: "client",
        status: "scheduled",
        scheduled_at: next.scheduledAt,
        last_action_at: now,
        sent_at: null,
        to_email: email,
        subject: mail.subject,
        body: mail.body,
        sequence_number: next.seq,
      } as never);

      if (insErr) {
        console.error("[automation] schedule follow_up", insErr);
        skipped += 1;
        await tryInsertAutomationExecution(admin, {
          userId,
          definitionId: def.id,
          slug: "quote_followup",
          phase: "schedule",
          status: "failed",
          idempotencyKey: `${idempotencyKey}:failed`,
          entityType: "document",
          entityId: doc.id,
          error: insErr.message,
        });
        continue;
      }

      stored.push({
        id: "pending",
        document_id: doc.id,
        chantier_id: doc.chantier_id,
        audience: "client",
        status: "scheduled",
        scheduled_at: next.scheduledAt,
        last_action_at: now,
        sent_at: null,
        to_email: email,
        subject: mail.subject,
        body: mail.body,
        created_at: now,
        sequence_number: next.seq,
      });
      scheduled += 1;
    }
  }

  return { scheduled, skipped, users: definitions.length };
}
