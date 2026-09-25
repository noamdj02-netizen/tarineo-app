import { EmailCta, EmailParagraph, NavpitEmailShell } from "./shell";

export type BillingStarterWelcomeEmailProps = { appUrl: string };

export function BillingStarterWelcomeEmail({ appUrl }: BillingStarterWelcomeEmailProps) {
  const base = appUrl.replace(/\/$/, "");
  return (
    <NavpitEmailShell
      preview="Bienvenue en Navpit Création"
      label="Création"
      title="Bienvenue en Création"
      appUrl={appUrl}
    >
      <EmailParagraph>
        6 projets, 300 questions IA par mois et 100 schémas. Ton prix baissera à chaque anniversaire d’abonnement.
      </EmailParagraph>
      <EmailCta href={`${base}/accueil`}>Ouvrir Navpit</EmailCta>
    </NavpitEmailShell>
  );
}

BillingStarterWelcomeEmail.PreviewProps = {
  appUrl: "https://www.navpit.com",
} satisfies BillingStarterWelcomeEmailProps;
export default BillingStarterWelcomeEmail;
