import { EmailCta, EmailParagraph, TarineoEmailShell } from "./shell";

export type BillingStarterWelcomeEmailProps = { appUrl: string };

export function BillingStarterWelcomeEmail({ appUrl }: BillingStarterWelcomeEmailProps) {
  const base = appUrl.replace(/\/$/, "");
  return (
    <TarineoEmailShell
      preview="Bienvenue en Tarinéo Création"
      label="Création"
      title="Bienvenue en Création"
      appUrl={appUrl}
    >
      <EmailParagraph>
        6 projets, 300 questions IA par mois et 100 schémas. Ton prix baissera à chaque anniversaire d’abonnement.
      </EmailParagraph>
      <EmailCta href={`${base}/accueil`}>Ouvrir Tarinéo</EmailCta>
    </TarineoEmailShell>
  );
}

BillingStarterWelcomeEmail.PreviewProps = {
  appUrl: "https://www.tarineo.fr",
} satisfies BillingStarterWelcomeEmailProps;
export default BillingStarterWelcomeEmail;
