import { EmailCta, EmailParagraph, TarineoEmailShell } from "./shell";

export type BillingProWelcomeEmailProps = { appUrl: string };

export function BillingProWelcomeEmail({ appUrl }: BillingProWelcomeEmailProps) {
  const base = appUrl.replace(/\/$/, "");
  return (
    <TarineoEmailShell
      preview="Bienvenue en TARINEO Pro"
      label="Pro"
      title="Bienvenue en Pro"
      appUrl={appUrl}
    >
      <EmailParagraph>
        Chantiers, analyses et pièces client sans plafond de démo. Votre prix baisse à chaque anniversaire d’abonnement.
      </EmailParagraph>
      <EmailCta href={`${base}/accueil`}>Ouvrir TARINEO</EmailCta>
    </TarineoEmailShell>
  );
}

BillingProWelcomeEmail.PreviewProps = { appUrl: "https://app.tarineo.com" } satisfies BillingProWelcomeEmailProps;
export default BillingProWelcomeEmail;
