import { EmailCta, EmailParagraph, NavpitEmailShell } from "./shell";

export type AuthSignupEmailProps = { appUrl: string; confirmationUrl: string };

export function AuthSignupEmail({ appUrl, confirmationUrl }: AuthSignupEmailProps) {
  return (
    <NavpitEmailShell preview="Confirme ton compte Navpit" label="Inscription" title="Plus qu’un clic" appUrl={appUrl}>
      <EmailParagraph>Confirme ton adresse email pour activer ton cockpit Navpit.</EmailParagraph>
      <EmailCta href={confirmationUrl}>Confirmer mon email</EmailCta>
    </NavpitEmailShell>
  );
}

AuthSignupEmail.PreviewProps = {
  appUrl: "https://www.navpit.com",
  confirmationUrl: "https://www.navpit.com/auth/callback",
} satisfies AuthSignupEmailProps;

export default AuthSignupEmail;
