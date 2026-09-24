import { EmailCta, EmailParagraph, NavpitEmailShell } from "./shell";

export type AuthResetPasswordEmailProps = { appUrl: string; confirmationUrl: string };

export function AuthResetPasswordEmail({ appUrl, confirmationUrl }: AuthResetPasswordEmailProps) {
  return (
    <NavpitEmailShell
      preview="Choisis un nouveau mot de passe Navpit"
      label="Mot de passe"
      title="Nouveau mot de passe"
      appUrl={appUrl}
    >
      <EmailParagraph>Tu as demandé à changer ton mot de passe. Le lien est valable environ une heure.</EmailParagraph>
      <EmailCta href={confirmationUrl}>Choisir mon mot de passe</EmailCta>
    </NavpitEmailShell>
  );
}

AuthResetPasswordEmail.PreviewProps = {
  appUrl: "https://www.navpit.com",
  confirmationUrl: "https://www.navpit.com/nouveau-mot-de-passe",
} satisfies AuthResetPasswordEmailProps;

export default AuthResetPasswordEmail;
