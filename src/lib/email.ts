import { Resend } from "resend";
import {
  renduEmailActivation,
  renduEmailReinitialisationMotDePasse,
  renduEmailResiliationConfirmee,
} from "@/lib/emails/templates";
import { echapperHtml } from "@/lib/emails/escape";
import { origineEmail } from "@/lib/emails/assets";
import { inlinerImagesEmail } from "@/lib/emails/inlineAssets";

async function envoyerHtml(params: {
  to: string;
  subject: string;
  html: string;
  text: string;
  replyTo?: string;
}): Promise<void> {
  const resend = new Resend(process.env.RESEND_API_KEY);
  const { html, attachments } = inlinerImagesEmail(params.html);

  const { error } = await resend.emails.send({
    from: process.env.EMAIL_FROM as string,
    to: params.to,
    replyTo: params.replyTo,
    subject: params.subject,
    html,
    text: params.text,
    attachments: attachments.map((a) => ({
      filename: a.filename,
      content: a.content,
      contentId: a.contentId,
    })),
  });

  if (error) {
    throw new Error("Impossible d'envoyer l'email : " + JSON.stringify(error));
  }
}

function prenomDepuisEmail(email: string): string {
  const partie = email.split("@")[0] ?? "Artisan";
  return partie.charAt(0).toUpperCase() + partie.slice(1);
}

export async function envoyerEmailActivation(
  to: string,
  urlConfirmation: string,
  options?: { origine?: string; urlDesinscription?: string },
): Promise<void> {
  const origine = options?.origine ?? origineEmail();

  const html = renduEmailActivation({
    urlConfirmation,
    origine,
    urlDesinscription: options?.urlDesinscription,
  });

  await envoyerHtml({
    to,
    subject: "Confirmez votre adresse email Tarineo",
    html,
    text: `Merci de votre inscription sur Tarineo. Pour activer votre compte, confirmez votre adresse : ${urlConfirmation}`,
  });
}

export async function envoyerEmailReinitialisation(
  to: string,
  urlReinitialisation: string,
  options?: { prenom?: string; origine?: string },
): Promise<void> {
  const prenom = options?.prenom ?? prenomDepuisEmail(to);
  const origine = options?.origine ?? origineEmail();

  const html = renduEmailReinitialisationMotDePasse({
    prenom,
    urlReinitialisation,
    origine,
  });

  await envoyerHtml({
    to,
    subject: "Réinitialisez votre mot de passe Tarineo",
    html,
    text: `Réinitialisation de votre mot de passe Tarineo : ${urlReinitialisation}\n\nCe lien est valable 1 heure et à usage unique.`,
  });
}

// dateFinAcces déjà formatée (fr-FR) — envoyé aussi bien pour une résiliation
// mensuelle (fin de période payée) que pour la désactivation du renouvellement
// d'un abonnement annuel (fin de l'engagement en cours) : voir
// src/app/(app)/compte/actions.ts.
export async function envoyerEmailResiliationAbonnement(
  to: string,
  dateFinAcces: string,
  options?: { prenom?: string; origine?: string },
): Promise<void> {
  const prenom = options?.prenom ?? prenomDepuisEmail(to);
  const origine = options?.origine ?? origineEmail();

  const html = renduEmailResiliationConfirmee({
    prenom,
    dateFinAcces,
    urlReactivation: `${origine}/compte`,
    origine,
  });

  await envoyerHtml({
    to,
    subject: "Confirmation : fin de votre abonnement Tarineo",
    html,
    text: `Votre abonnement Tarineo ne sera pas reconduit. Accès conservé jusqu'au ${dateFinAcces}, sans nouveau prélèvement après cette date.`,
  });
}

export interface DemandeContactEntreprise {
  nom: string;
  email: string;
  volume: string;
  message: string;
}

function renduHtmlContactEntrepriseInterne(donnee: DemandeContactEntreprise): string {
  const messageBloc = donnee.message
    ? `<p style="color:#43454b;font-size:15px;line-height:1.5;"><strong style="color:#14171e;">Message :</strong><br/>${echapperHtml(donnee.message)}</p>`
    : "";

  return `
    <div style="background:#ffffff;padding:40px 24px;font-family:'Inter',Arial,Helvetica,sans-serif;">
      <div style="max-width:544px;margin:0 auto;background:#f3f4f6;border-radius:16px;padding:32px;">
        <h1 style="color:#14171e;font-size:20px;margin:0 0 16px;">Tarineo — Demande Entreprise</h1>
        <p style="color:#43454b;font-size:15px;line-height:1.5;">
          <strong style="color:#14171e;">${echapperHtml(donnee.nom)}</strong> (${echapperHtml(donnee.email)}) a
          demandé à être contacté depuis la landing page.
        </p>
        <p style="color:#43454b;font-size:15px;line-height:1.5;">
          <strong style="color:#14171e;">Taille d'équipe / volume estimé :</strong><br/>${echapperHtml(donnee.volume)}
        </p>
        ${messageBloc}
      </div>
    </div>`;
}

// Palier "Entreprise" de la section Tarifs : pas d'espace client dédié, juste un email
// à l'adresse de contact (CONTACT_ENTREPRISE_EMAIL) — voir
// src/app/(public)/contactEntrepriseActions.ts. replyTo pointe vers le prospect pour
// pouvoir lui répondre directement depuis la messagerie, sans avoir à recopier son email.
export async function envoyerEmailContactEntreprise(donnee: DemandeContactEntreprise): Promise<void> {
  const destinataire = process.env.CONTACT_ENTREPRISE_EMAIL as string;

  await envoyerHtml({
    to: destinataire,
    replyTo: donnee.email,
    subject: `Demande palier Entreprise — ${donnee.nom}`,
    html: renduHtmlContactEntrepriseInterne(donnee),
    text: `Nouvelle demande Entreprise depuis la landing page.\n\nNom : ${donnee.nom}\nEmail : ${donnee.email}\nTaille d'équipe / volume estimé : ${donnee.volume}${donnee.message ? `\nMessage : ${donnee.message}` : ""}`,
  });
}

export async function envoyerEmailDocument(params: {
  to: string;
  subject: string;
  body: string;
  replyTo?: string;
  attachment: { filename: string; content: Buffer };
}): Promise<void> {
  const resend = new Resend(process.env.RESEND_API_KEY);

  const { error } = await resend.emails.send({
    from: process.env.EMAIL_FROM as string,
    to: params.to,
    replyTo: params.replyTo,
    subject: params.subject,
    text: params.body,
    attachments: [
      {
        filename: params.attachment.filename,
        content: params.attachment.content,
      },
    ],
  });

  if (error) {
    throw new Error("Impossible d'envoyer l'email : " + JSON.stringify(error));
  }
}

// Réexport des fonctions de rendu pour les futurs envois transactionnels / marketing.
export {
  renduEmailActivation,
  renduEmailAlerteHaussePrix,
  renduEmailBaissePrix,
  renduEmailBienvenue,
  renduEmailConfirmationAbonnement,
  renduEmailDemandeAvisNps,
  renduEmailEssaiExpire,
  renduEmailExportPret,
  renduEmailFactureDisponible,
  renduEmailInvitationEquipe,
  renduEmailMiseAJourForfait,
  renduEmailNotesDeVersion,
  renduEmailNouveauMembreEquipe,
  renduEmailParrainage,
  renduEmailReinitialisationMotDePasse,
  renduEmailRelanceInactif,
  renduEmailResiliationConfirmee,
  renduEmailTexte,
  renduEmailTexteDemo,
} from "@/lib/emails/templates";

export { CATALOGUE_EMAILS, renduEmailPreview, sujetEmail, type SlugEmail } from "@/lib/emails";
