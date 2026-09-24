import { EmailCta, EmailParagraph, NavpitEmailShell } from "./shell";

export type AuthEmailChangeEmailProps = { appUrl: string; confirmationUrl: string };

export function AuthEmailChangeEmail({ appUrl, confirmationUrl }: AuthEmailChangeEmailProps) {
  return (
    <NavpitEmailShell
      preview="Confirme ta nouvelle adresse Navpit"
      label="Email"
      title="Confirme ta nouvelle adresse"
      appUrl={appUrl}
    >
      <EmailParagraph>Clique pour utiliser cette adresse email sur ton compte Navpit.</EmailParagraph>
      <EmailCta href={confirmationUrl}>Confirmer l’adresse</EmailCta>
    </NavpitEmailShell>
  );
}

AuthEmailChangeEmail.PreviewProps = {
  appUrl: "https://www.navpit.com",
  confirmationUrl: "https://www.navpit.com/auth/callback",
} satisfies AuthEmailChangeEmailProps;

export default AuthEmailChangeEmail;
