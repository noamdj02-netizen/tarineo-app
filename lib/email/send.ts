import "server-only";
import { Resend } from "resend";

let client: Resend | null = null;

/** Envoie un email React via Resend. Sans RESEND_API_KEY, ne fait rien (dev local). */
export async function sendEmail(
  to: string,
  subject: string,
  react: React.ReactElement,
  idempotencyKey?: string,
) {
  const key = process.env.RESEND_API_KEY;
  if (!key) return { ok: false as const, skipped: true as const };
  client ??= new Resend(key);
  const { error } = await client.emails.send(
    {
      from: process.env.EMAIL_FROM ?? "Navpit <bonjour@navpit.com>",
      to,
      subject,
      react,
    },
    idempotencyKey ? { idempotencyKey } : undefined,
  );
  if (error) console.error("[email]", subject, error);
  return { ok: !error, skipped: false as const };
}
