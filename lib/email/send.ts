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

/** Mail texte du copilote (Resend). Reply-To = l’user. */
export async function sendPlainEmail(input: {
  to: string;
  subject: string;
  text: string;
  replyTo?: string;
}) {
  const key = process.env.RESEND_API_KEY;
  if (!key) return { ok: false as const, skipped: true as const, error: "RESEND_API_KEY manquant." };
  client ??= new Resend(key);
  const html = `<pre style="font:15px/1.45 ui-sans-serif,system-ui;white-space:pre-wrap">${escapeHtml(
    input.text,
  )}</pre>`;
  const { data, error } = await client.emails.send({
    from: process.env.EMAIL_FROM ?? "Navpit <bonjour@navpit.com>",
    to: input.to,
    subject: input.subject,
    text: input.text,
    html,
    replyTo: input.replyTo,
  });
  if (error) {
    console.error("[email]", input.subject, error);
    return { ok: false as const, skipped: false as const, error: error.message };
  }
  return { ok: true as const, skipped: false as const, id: data?.id ?? null };
}

function escapeHtml(s: string) {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
