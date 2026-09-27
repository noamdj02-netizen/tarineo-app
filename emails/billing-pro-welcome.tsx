import { EmailCta, EmailParagraph, TarineoEmailShell } from "./shell";

export type BillingProWelcomeEmailProps = { appUrl: string };

export function BillingProWelcomeEmail({ appUrl }: BillingProWelcomeEmailProps) {
  const base = appUrl.replace(/\/$/, "");
  return (
    <TarineoEmailShell
      preview="Bienvenue en Tarinéo Pro"
      label="Pro"
      title="Bienvenue en Pro"
      appUrl={appUrl}
    >
      <EmailParagraph>
        Chantiers, analyses et pièces client sans plafond de démo. Votre prix baisse à chaque anniversaire d’abonnement.
      </EmailParagraph>
      <EmailCta href={`${base}/accueil`}>Ouvrir Tarinéo</EmailCta>
    </TarineoEmailShell>
  );
}

BillingProWelcomeEmail.PreviewProps = { appUrl: "https://www.tarineo.fr" } satisfies BillingProWelcomeEmailProps;
export default BillingProWelcomeEmail;
