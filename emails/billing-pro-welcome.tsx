import { EmailCta, EmailParagraph, NavpitEmailShell } from "./shell";

export type BillingProWelcomeEmailProps = { appUrl: string };

export function BillingProWelcomeEmail({ appUrl }: BillingProWelcomeEmailProps) {
  const base = appUrl.replace(/\/$/, "");
  return (
    <NavpitEmailShell
      preview="Bienvenue en Navpit Pro"
      label="Pro"
      title="Bienvenue en Pro"
      appUrl={appUrl}
    >
      <EmailParagraph>
        Projets illimités, 500 questions IA par mois, schémas illimités et agenda synchronisé. Et ton prix baissera à
        chaque anniversaire d’abonnement.
      </EmailParagraph>
      <EmailCta href={`${base}/accueil`}>Ouvrir Navpit</EmailCta>
    </NavpitEmailShell>
  );
}

BillingProWelcomeEmail.PreviewProps = { appUrl: "https://www.navpit.com" } satisfies BillingProWelcomeEmailProps;
export default BillingProWelcomeEmail;
