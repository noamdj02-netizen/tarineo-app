import "server-only";

import { CheckInEmail, CHECK_IN_SUBJECT } from "@/emails/check-in";
import { BRAND } from "@/lib/brand";
import { sendEmail } from "@/lib/email/send";
import { createAdminClient } from "@/lib/supabase/admin";
import { getSiteUrl } from "@/lib/site-url";

/** Envoyer le check-in à partir de J+N après inscription. */
export const CHECK_IN_DELAY_DAYS = 2;
/** Ne pas rattraper les comptes trop anciens au premier déploiement du cron. */
export const CHECK_IN_MAX_AGE_DAYS = 21;
/** Cap par run cron (évite rate-limit Resend / listUsers). */
const MAX_SENDS_PER_RUN = 40;

function firstNameFromMeta(meta: Record<string, unknown> | undefined): string {
  const name = [meta?.first_name, meta?.full_name, meta?.name].find(
    (v): v is string => typeof v === "string" && v.trim().length > 0,
  );
  return name?.trim().split(/\s+/)[0] ?? "";
}

function alreadySent(meta: Record<string, unknown> | undefined): boolean {
  if (meta?.check_in_sent === true) return true;
  if (typeof meta?.check_in_sent_at === "string" && meta.check_in_sent_at.length > 0) return true;
  return false;
}

export type CheckInRunResult = {
  scanned: number;
  sent: number;
  failed: number;
  skipped: number;
  errors: string[];
};

/**
 * Envoie le mail check-in aux inscrits éligibles (J+2 … J+21, pas encore envoyé).
 * Idempotent via user_metadata.check_in_sent.
 */
export async function processSignupCheckIns(now = new Date()): Promise<CheckInRunResult> {
  const admin = createAdminClient();
  const appUrl = getSiteUrl();
  const replyTo = process.env.CHECK_IN_REPLY_TO?.trim() || BRAND.contactEmail;
  const minAgeMs = CHECK_IN_DELAY_DAYS * 864e5;
  const maxAgeMs = CHECK_IN_MAX_AGE_DAYS * 864e5;
  const nowMs = now.getTime();

  let page = 1;
  let scanned = 0;
  let sent = 0;
  let failed = 0;
  let skipped = 0;
  const errors: string[] = [];

  while (sent + failed < MAX_SENDS_PER_RUN) {
    const { data, error } = await admin.auth.admin.listUsers({ page, perPage: 200 });
    if (error) {
      errors.push(error.message);
      break;
    }
    const users = data?.users ?? [];
    if (!users.length) break;

    for (const user of users) {
      scanned += 1;
      if (!user.email) {
        skipped += 1;
        continue;
      }
      const meta = (user.user_metadata ?? {}) as Record<string, unknown>;
      if (alreadySent(meta)) {
        skipped += 1;
        continue;
      }
      const created = new Date(user.created_at).getTime();
      if (!Number.isFinite(created)) {
        skipped += 1;
        continue;
      }
      const age = nowMs - created;
      if (age < minAgeMs || age > maxAgeMs) {
        skipped += 1;
        continue;
      }

      const firstName = firstNameFromMeta(meta);
      const result = await sendEmail(
        user.email,
        CHECK_IN_SUBJECT,
        CheckInEmail({ firstName, appUrl, replyTo }),
        {
          idempotencyKey: `check-in:${user.id}`,
          replyTo,
        },
      );

      if (!result.ok) {
        failed += 1;
        if (result.error) errors.push(`${user.email}: ${result.error}`);
        if (result.skipped) {
          // Resend off : inutile de continuer
          return { scanned, sent, failed, skipped, errors };
        }
        continue;
      }

      const { error: updateError } = await admin.auth.admin.updateUserById(user.id, {
        user_metadata: {
          ...meta,
          check_in_sent: true,
          check_in_sent_at: now.toISOString(),
        },
      });
      if (updateError) {
        failed += 1;
        errors.push(`${user.email}: mark ${updateError.message}`);
        continue;
      }
      sent += 1;
      if (sent >= MAX_SENDS_PER_RUN) break;
    }

    if (users.length < 200) break;
    page += 1;
    if (page > 50) break;
  }

  return { scanned, sent, failed, skipped, errors: errors.slice(0, 10) };
}
