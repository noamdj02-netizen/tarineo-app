import { EmailCta, EmailParagraph, NavpitEmailShell } from "./shell";

export type WelcomeEmailProps = { firstName: string; appUrl: string };

export function WelcomeEmail({ firstName, appUrl }: WelcomeEmailProps) {
  const base = appUrl.replace(/\/$/, "");
  const greeting = firstName ? `, ${firstName}` : "";

  return (
    <NavpitEmailShell
      preview="Ton cockpit est prêt : ajoute ton premier projet."
      label="Bienvenue"
      title={`Bienvenue${greeting}`}
      appUrl={appUrl}
      steps={[
        {
          title: "Ajoute tes projets",
          text: "Liens Figma, repo, staging : tout au même endroit.",
          href: `${base}/projets#nouveau`,
          linkLabel: "Créer un projet",
        },
        {
          title: "Choisis ton Focus",
          text: "Un seul projet prioritaire jusqu’à la première vente.",
          href: `${base}/accueil`,
          linkLabel: "Voir l’accueil",
        },
        {
          title: "Parle au copilote",
          text: "Il connaît tes projets et te propose la prochaine action.",
          href: `${base}/copilote`,
          linkLabel: "Ouvrir le copilote",
        },
      ]}
    >
      <EmailParagraph>
        Ton cockpit Navpit est prêt. Tu peux explorer tout de suite, finir l’onboarding et inviter ton équipe si tu
        travailles à plusieurs.
      </EmailParagraph>
      <EmailCta href={`${base}/projets#nouveau`}>Ajouter mon premier projet</EmailCta>
      <EmailParagraph>Une question ? Réponds à cet email, on lit tout.</EmailParagraph>
    </NavpitEmailShell>
  );
}

WelcomeEmail.PreviewProps = {
  firstName: "Noam",
  appUrl: "https://www.navpit.com",
} satisfies WelcomeEmailProps;

export default WelcomeEmail;
