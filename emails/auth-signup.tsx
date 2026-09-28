import { EmailCode, EmailCta, EmailParagraph, TarineoEmailShell } from "./shell";

export type AuthSignupEmailProps = { appUrl: string; confirmationUrl: string; token: string };

export function AuthSignupEmail({ appUrl, confirmationUrl, token }: AuthSignupEmailProps) {
  return (
    <TarineoEmailShell preview="Ton code pour activer TARINEO" label="Inscription" title="Active ton compte" appUrl={appUrl}>
      <EmailParagraph>
        Entre ce code sur la page d’inscription, ou clique le bouton. Il est valable une heure.
      </EmailParagraph>
      <EmailCode>{token}</EmailCode>
      <EmailCta href={confirmationUrl}>Confirmer mon email</EmailCta>
    </TarineoEmailShell>
  );
}

AuthSignupEmail.PreviewProps = {
  appUrl: "https://app.tarineo.com",
  confirmationUrl: "https://app.tarineo.com/auth/callback",
  token: "482913",
} satisfies AuthSignupEmailProps;

export default AuthSignupEmail;
