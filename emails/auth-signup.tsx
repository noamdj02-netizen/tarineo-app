import { EmailCode, EmailCta, EmailParagraph, TarineoEmailShell } from "./shell";

export type AuthSignupEmailProps = { appUrl: string; confirmationUrl: string; token: string };

export function AuthSignupEmail({ appUrl, confirmationUrl, token }: AuthSignupEmailProps) {
  return (
    <TarineoEmailShell preview="Ton code pour activer Tarinéo" label="Inscription" title="Active ton compte" appUrl={appUrl}>
      <EmailParagraph>
        Entre ce code sur la page d’inscription, ou clique le bouton. Il est valable une heure.
      </EmailParagraph>
      <EmailCode>{token}</EmailCode>
      <EmailCta href={confirmationUrl}>Confirmer mon email</EmailCta>
    </TarineoEmailShell>
  );
}

AuthSignupEmail.PreviewProps = {
  appUrl: "https://www.tarineo.fr",
  confirmationUrl: "https://www.tarineo.fr/auth/callback",
  token: "482913",
} satisfies AuthSignupEmailProps;

export default AuthSignupEmail;
