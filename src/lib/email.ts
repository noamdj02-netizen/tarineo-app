import { Resend } from "resend";

// Échappe les caractères HTML sensibles avant d'interpoler du texte fourni par un
// visiteur (formulaire de contact Entreprise) dans un email HTML — sans ça, un nom ou
// message contenant des balises serait injecté tel quel dans l'email reçu.
function echapperHtml(texte: string): string {
  return texte
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export async function envoyerEmailReinitialisation(to: string, urlReinitialisation: string): Promise<void> {
  const resend = new Resend(process.env.RESEND_API_KEY);

  const { error } = await resend.emails.send({
    from: process.env.EMAIL_FROM as string,
    to,
    subject: "Réinitialisez votre mot de passe Tarineo",
    html: `
      <div style="background:#0b0f1a;padding:40px 24px;font-family:Arial,Helvetica,sans-serif;">
        <div style="max-width:480px;margin:0 auto;background:#131826;border-radius:12px;padding:32px;">
          <h1 style="color:#f5f5f5;font-size:20px;margin:0 0 16px;">Tarineo</h1>
          <p style="color:#c7c9d1;font-size:15px;line-height:1.5;">
            Vous avez demandé la réinitialisation de votre mot de passe. Cliquez sur le bouton ci-dessous pour en
            choisir un nouveau. Ce lien est valable 1 heure et ne peut être utilisé qu'une seule fois.
          </p>
          <a href="${urlReinitialisation}" style="display:inline-block;margin-top:16px;background:#f97316;color:#ffffff;font-weight:bold;text-decoration:none;padding:12px 24px;border-radius:8px;">
            Réinitialiser mon mot de passe
          </a>
          <p style="color:#6b7280;font-size:12px;margin-top:24px;">
            Si vous n'êtes pas à l'origine de cette demande, vous pouvez ignorer cet email : votre mot de passe
            actuel reste inchangé.
          </p>
        </div>
      </div>
    `,
    text: `Réinitialisation de votre mot de passe Tarineo : ${urlReinitialisation}\n\nCe lien est valable 1 heure et à usage unique.`,
  });

  if (error) {
    throw new Error("Impossible d'envoyer l'email de réinitialisation : " + JSON.stringify(error));
  }
}

// dateFinAcces déjà formatée (fr-FR) — envoyé aussi bien pour une résiliation
// mensuelle (fin de période payée) que pour la désactivation du renouvellement
// d'un abonnement annuel (fin de l'engagement en cours) : voir
// src/app/(app)/compte/actions.ts.
export async function envoyerEmailResiliationAbonnement(to: string, dateFinAcces: string): Promise<void> {
  const resend = new Resend(process.env.RESEND_API_KEY);

  const { error } = await resend.emails.send({
    from: process.env.EMAIL_FROM as string,
    to,
    subject: "Confirmation : fin de votre abonnement Tarineo",
    html: `
      <div style="background:#0b0f1a;padding:40px 24px;font-family:Arial,Helvetica,sans-serif;">
        <div style="max-width:480px;margin:0 auto;background:#131826;border-radius:12px;padding:32px;">
          <h1 style="color:#f5f5f5;font-size:20px;margin:0 0 16px;">Tarineo</h1>
          <p style="color:#c7c9d1;font-size:15px;line-height:1.5;">
            C'est confirmé : votre abonnement ne sera pas reconduit. Vous gardez accès à toutes les
            fonctionnalités jusqu'au <strong style="color:#f5f5f5;">${dateFinAcces}</strong>, sans autre
            prélèvement après cette date.
          </p>
          <p style="color:#6b7280;font-size:12px;margin-top:24px;">
            Vous pouvez revenir à tout moment avant cette date pour changer d'avis depuis "Mon compte".
          </p>
        </div>
      </div>
    `,
    text: `Votre abonnement Tarineo ne sera pas reconduit. Accès conservé jusqu'au ${dateFinAcces}, sans nouveau prélèvement après cette date.`,
  });

  if (error) {
    throw new Error("Impossible d'envoyer l'email de confirmation de résiliation : " + JSON.stringify(error));
  }
}

export interface DemandeContactEntreprise {
  nom: string;
  email: string;
  volume: string;
  message: string;
}

// Palier "Entreprise" de la section Tarifs : pas d'espace client dédié, juste un email
// à l'adresse de contact (CONTACT_ENTREPRISE_EMAIL) — voir
// src/app/(public)/contactEntrepriseActions.ts. replyTo pointe vers le prospect pour
// pouvoir lui répondre directement depuis la messagerie, sans avoir à recopier son email.
export async function envoyerEmailContactEntreprise(donnee: DemandeContactEntreprise): Promise<void> {
  const resend = new Resend(process.env.RESEND_API_KEY);
  const destinataire = process.env.CONTACT_ENTREPRISE_EMAIL as string;

  const { error } = await resend.emails.send({
    from: process.env.EMAIL_FROM as string,
    to: destinataire,
    replyTo: donnee.email,
    subject: `Demande palier Entreprise — ${donnee.nom}`,
    html: `
      <div style="background:#0b0f1a;padding:40px 24px;font-family:Arial,Helvetica,sans-serif;">
        <div style="max-width:480px;margin:0 auto;background:#131826;border-radius:12px;padding:32px;">
          <h1 style="color:#f5f5f5;font-size:20px;margin:0 0 16px;">Tarineo — Demande Entreprise</h1>
          <p style="color:#c7c9d1;font-size:15px;line-height:1.5;">
            <strong style="color:#f5f5f5;">${echapperHtml(donnee.nom)}</strong> (${echapperHtml(donnee.email)}) a
            demandé à être contacté depuis la landing page.
          </p>
          <p style="color:#c7c9d1;font-size:15px;line-height:1.5;">
            <strong style="color:#f5f5f5;">Taille d'équipe / volume estimé :</strong><br/>${echapperHtml(donnee.volume)}
          </p>
          ${
            donnee.message
              ? `<p style="color:#c7c9d1;font-size:15px;line-height:1.5;"><strong style="color:#f5f5f5;">Message :</strong><br/>${echapperHtml(donnee.message)}</p>`
              : ""
          }
        </div>
      </div>
    `,
    text: `Nouvelle demande Entreprise depuis la landing page.\n\nNom : ${donnee.nom}\nEmail : ${donnee.email}\nTaille d'équipe / volume estimé : ${donnee.volume}${donnee.message ? `\nMessage : ${donnee.message}` : ""}`,
  });

  if (error) {
    throw new Error("Impossible d'envoyer la demande de contact Entreprise : " + JSON.stringify(error));
  }
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
