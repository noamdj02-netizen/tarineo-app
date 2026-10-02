import "server-only";
import { Resend } from "resend";
import { BRAND } from "@/lib/brand";

const TARINEO_FROM = `${BRAND.name} <${BRAND.contactEmail}>`;

function fromAddress() {
  const raw = process.env.EMAIL_FROM?.trim();
  // Domaine Resend non vérifié (.fr) ou legacy Navpit → fallback TARINEO vérifié.
  if (
    !raw ||
    /navpit/i.test(raw) ||
    /@tarineo\.fr\b/i.test(raw) ||
    /[éÉ]/.test(raw.split("<")[0] ?? "")
  ) {
    return TARINEO_FROM;
  }
  return raw;
}

function describeSendError(error: { message?: string; name?: string } | null) {
  const text = `${error?.name ?? ""} ${error?.message ?? ""}`.toLowerCase();
  if (text.includes("not authorized") || text.includes("403") || text.includes("domain")) {
    return "L’envoi est refusé par Resend : la clé ou le domaine ne correspond pas à TARINEO (contact@tarineo.fr).";
  }
  return error?.message || "L’email n’est pas parti. Réessaie dans un moment.";
}

let client: Resend | null = null;

/** Envoie un email React via Resend. Sans RESEND_API_KEY, ne fait rien (dev local). */
export async function sendEmail(
  to: string,
  subject: string,
  react: React.ReactElement,
  idempotencyKey?: string,
) {
  const key = process.env.RESEND_API_KEY;
  if (!key) {
    if (process.env.NODE_ENV === "production") console.error("[email] RESEND_API_KEY manquant");
    return { ok: false as const, skipped: true as const };
  }
  client ??= new Resend(key);
  const { error } = await client.emails.send(
    {
      from: fromAddress(),
      to,
      subject,
      react,
    },
    idempotencyKey ? { idempotencyKey } : undefined,
  );
  if (error) {
    console.error("[email]", subject, fromAddress(), error);
    return { ok: false as const, skipped: false as const, error: describeSendError(error) };
  }
  return { ok: true as const, skipped: false as const };
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
    from: fromAddress(),
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

export async function sendEmailWithPdf(input: {
  to: string;
  subject: string;
  text: string;
  html?: string;
  filename: string;
  pdf: Buffer;
  replyTo?: string;
  inline?: { filename: string; content: Buffer; contentId: string }[];
  idempotencyKey?: string;
}) {
  const key = process.env.RESEND_API_KEY;
  if (!key) {
    if (process.env.NODE_ENV === "production") console.error("[email] RESEND_API_KEY manquant");
    return { ok: false as const, skipped: true as const, error: "E-mail non configuré (RESEND_API_KEY)." };
  }
  client ??= new Resend(key);
  const attachments = [
    { filename: input.filename, content: input.pdf },
    ...(input.inline ?? []).map((f) => ({
      filename: f.filename,
      content: f.content,
      contentId: f.contentId,
      content_id: f.contentId,
    })),
  ];
  const { data, error } = await client.emails.send(
    {
      from: fromAddress(),
      to: input.to,
      subject: input.subject,
      text: input.text,
      html: input.html ?? `<p style="font:15px/1.5 sans-serif;white-space:pre-wrap">${escapeHtml(input.text)}</p>`,
      replyTo: input.replyTo,
      attachments,
    } as Parameters<Resend["emails"]["send"]>[0],
    input.idempotencyKey ? { idempotencyKey: input.idempotencyKey } : undefined,
  );
  if (error) return { ok: false as const, skipped: false as const, error: error.message };
  return { ok: true as const, skipped: false as const, id: data?.id ?? null };
}

export async function sendEmailWithAttachment(input: {
  to: string;
  subject: string;
  text: string;
  html?: string;
  filename: string;
  content: Buffer;
  contentType?: string;
  replyTo?: string;
  idempotencyKey?: string;
}) {
  const key = process.env.RESEND_API_KEY;
  if (!key) {
    if (process.env.NODE_ENV === "production") console.error("[email] RESEND_API_KEY manquant");
    return { ok: false as const, skipped: true as const, error: "E-mail non configuré (RESEND_API_KEY)." };
  }
  client ??= new Resend(key);
  const { data, error } = await client.emails.send(
    {
      from: fromAddress(),
      to: input.to,
      subject: input.subject,
      text: input.text,
      html: input.html ?? `<p style="font:15px/1.5 sans-serif;white-space:pre-wrap">${escapeHtml(input.text)}</p>`,
      replyTo: input.replyTo,
      attachments: [{ filename: input.filename, content: input.content }],
    } as Parameters<Resend["emails"]["send"]>[0],
    input.idempotencyKey ? { idempotencyKey: input.idempotencyKey } : undefined,
  );
  if (error) return { ok: false as const, skipped: false as const, error: error.message };
  return { ok: true as const, skipped: false as const, id: data?.id ?? null };
}

function escapeHtml(s: string) {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
