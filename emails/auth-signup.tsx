import { EmailCode, EmailCta, EmailParagraph, NavpitEmailShell } from "./shell";

export type AuthSignupEmailProps = { appUrl: string; confirmationUrl: string; token: string };

export function AuthSignupEmail({ appUrl, confirmationUrl, token }: AuthSignupEmailProps) {
  return (
    <NavpitEmailShell preview="Ton code pour activer Navpit" label="Inscription" title="Active ton compte" appUrl={appUrl}>
      <EmailParagraph>
        Entre ce code sur la page d’inscription, ou clique le bouton. Il est valable une heure.
      </EmailParagraph>
      <EmailCode>{token}</EmailCode>
      <EmailCta href={confirmationUrl}>Confirmer mon email</EmailCta>
    </NavpitEmailShell>
  );
}

AuthSignupEmail.PreviewProps = {
  appUrl: "https://www.navpit.com",
  confirmationUrl: "https://www.navpit.com/auth/callback",
  token: "482913",
} satisfies AuthSignupEmailProps;

export default AuthSignupEmail;
