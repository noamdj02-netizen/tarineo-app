import { EmailCode, EmailCta, EmailParagraph, TarineoEmailShell } from "./shell";

export type AuthResetPasswordEmailProps = { appUrl: string; confirmationUrl: string; token: string };

export function AuthResetPasswordEmail({ appUrl, confirmationUrl, token }: AuthResetPasswordEmailProps) {
  return (
    <TarineoEmailShell
      preview="Ton code pour choisir un nouveau mot de passe"
      label="Mot de passe"
      title="Nouveau mot de passe"
      appUrl={appUrl}
    >
      <EmailParagraph>
        Entre ce code sur la page « mot de passe oublié », ou clique le bouton. Il est valable une heure.
      </EmailParagraph>
      <EmailCode>{token}</EmailCode>
      <EmailCta href={confirmationUrl}>Choisir mon mot de passe</EmailCta>
    </TarineoEmailShell>
  );
}

AuthResetPasswordEmail.PreviewProps = {
  appUrl: "https://app.tarineo.com",
  confirmationUrl: "https://app.tarineo.com/nouveau-mot-de-passe",
  token: "482913",
} satisfies AuthResetPasswordEmailProps;

export default AuthResetPasswordEmail;
