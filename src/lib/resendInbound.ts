import { Resend } from "resend";

export function secretWebhookInbound(): string | undefined {
  const secret = process.env.RESEND_INBOUND_WEBHOOK_SECRET?.trim();
  return secret || undefined;
}

/** Vérifie la requête Resend (Svix) ou un Bearer partagé en secours (tests locaux). */
export function verifierRequeteWebhookInbound(request: Request, corpsBrut: string): boolean {
  const secret = secretWebhookInbound();
  if (!secret) {
    return process.env.NODE_ENV !== "production";
  }

  const svixId = request.headers.get("svix-id");
  const svixTimestamp = request.headers.get("svix-timestamp");
  const svixSignature = request.headers.get("svix-signature");

  if (svixId && svixTimestamp && svixSignature && secret.startsWith("whsec_")) {
    try {
      const resend = new Resend(process.env.RESEND_API_KEY);
      resend.webhooks.verify({
        payload: corpsBrut,
        headers: { id: svixId, timestamp: svixTimestamp, signature: svixSignature },
        webhookSecret: secret,
      });
      return true;
    } catch {
      return false;
    }
  }

  const auth = request.headers.get("authorization");
  return auth === `Bearer ${secret}`;
}

export async function telechargerPieceJointeInbound(emailId: string, attachmentId: string): Promise<Buffer | null> {
  const resend = new Resend(process.env.RESEND_API_KEY);
  const { data, error } = await resend.emails.receiving.attachments.get({ emailId, id: attachmentId });
  if (error || !data?.download_url) return null;

  const reponse = await fetch(data.download_url);
  if (!reponse.ok) return null;
  return Buffer.from(await reponse.arrayBuffer());
}
