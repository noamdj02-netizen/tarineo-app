/**
 * Envoie tous les modèles email du catalogue à une ou plusieurs adresses.
 * Usage : npx tsx scripts/envoyer-catalogue-emails.mts email1 [email2 ...]
 */
import { readFileSync } from "node:fs";
import { parse } from "dotenv";
import { Resend } from "resend";
import { CATALOGUE_EMAILS, renduEmailPreview, sujetEmail } from "../src/lib/emails";
import { inlinerImagesEmail } from "../src/lib/emails/inlineAssets";

const SANDBOX_FROM = "Tarineo <onboarding@resend.dev>";
const SANDBOX_DESTINATAIRE = "noamdj02@gmail.com";

const env = parse(readFileSync(".env", "utf8"));
const apiKey = env.RESEND_API_KEY ?? process.env.RESEND_API_KEY;
const fromProd = env.EMAIL_FROM ?? process.env.EMAIL_FROM;
const destinataires =
  process.argv.length > 2
    ? process.argv.slice(2)
    : ["alann.drapier@gmail.com", SANDBOX_DESTINATAIRE];
const origine = env.AUTH_URL?.includes("localhost")
  ? "https://app.tarineo.com"
  : (env.AUTH_URL ?? "https://app.tarineo.com");

if (!apiKey) {
  console.error("RESEND_API_KEY requis dans .env");
  process.exit(1);
}

const resend = new Resend(apiKey);

function fromPour(destinataire: string): string {
  if (destinataire === SANDBOX_DESTINATAIRE) return SANDBOX_FROM;
  return fromProd ?? SANDBOX_FROM;
}

async function envoyer(slug: string, sujet: string, destinataire: string): Promise<void> {
  const htmlBrut = renduEmailPreview(slug as Parameters<typeof renduEmailPreview>[0], origine);
  const { html, attachments } = inlinerImagesEmail(htmlBrut);
  const from = fromPour(destinataire);

  const { data, error } = await resend.emails.send({
    from,
    to: destinataire,
    subject: `[Preview] ${sujet}`,
    html,
    text: `Aperçu du modèle « ${slug} » — Tarineo (${origine})`,
    attachments: attachments.map((a) => ({
      filename: a.filename,
      content: a.content,
      contentId: a.contentId,
    })),
  });

  if (error) {
    throw new Error(`${slug} → ${destinataire}: ${JSON.stringify(error)}`);
  }

  console.log(`ok ${slug} → ${destinataire} (${data?.id ?? "?"})`);
}

async function main() {
  console.log(
    `Envoi de ${CATALOGUE_EMAILS.length} modèles × ${destinataires.length} destinataire(s) (origine: ${origine})`,
  );
  let echecs = 0;
  for (const destinataire of destinataires) {
    console.log(`--- ${destinataire} (from: ${fromPour(destinataire)}) ---`);
    for (const { slug } of CATALOGUE_EMAILS) {
      try {
        await envoyer(slug, sujetEmail(slug), destinataire);
        await new Promise((r) => setTimeout(r, 600));
      } catch (erreur) {
        echecs++;
        console.error(String(erreur));
        break;
      }
    }
  }
  if (echecs > 0) process.exitCode = 1;
  console.log("Terminé.");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
