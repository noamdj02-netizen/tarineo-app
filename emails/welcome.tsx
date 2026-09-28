import { EmailCta, EmailParagraph, TarineoEmailShell } from "./shell";

export type WelcomeEmailProps = { firstName: string; appUrl: string };

export function WelcomeEmail({ firstName, appUrl }: WelcomeEmailProps) {
  const base = appUrl.replace(/\/$/, "");
  const greeting = firstName ? `, ${firstName}` : "";

  return (
    <TarineoEmailShell
      preview="Votre tableau de bord est prêt : entreprise, chantier, devis."
      label="Bienvenue"
      title={`Bienvenue${greeting}`}
      appUrl={appUrl}
      steps={[
        {
          title: "Renseignez l’entreprise",
          text: "SIRET et mentions légales : elles iront sur chaque PDF.",
          href: `${base}/entreprise`,
          linkLabel: "Mon entreprise",
        },
        {
          title: "Ouvrez un chantier",
          text: "Rangez les devis Cedeo et les pièces client par affaire.",
          href: `${base}/chantiers`,
          linkLabel: "Chantiers",
        },
        {
          title: "Déposez un devis",
          text: "On lit les lignes, vous transformez, vous renvoyez au client.",
          href: `${base}/distributeur/devis`,
          linkLabel: "Documents distributeur",
        },
      ]}
    >
      <EmailParagraph>
        TARINEO est prêt. Finissez l’accueil guidé, puis déposez le premier devis distributeur.
      </EmailParagraph>
      <EmailCta href={`${base}/onboarding`}>Continuer l’accueil</EmailCta>
      <EmailParagraph>Une question ? Répondez à cet email.</EmailParagraph>
    </TarineoEmailShell>
  );
}

WelcomeEmail.PreviewProps = {
  firstName: "Noam",
  appUrl: "https://app.tarineo.com",
} satisfies WelcomeEmailProps;

export default WelcomeEmail;
