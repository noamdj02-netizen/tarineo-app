import { EmailCode, EmailCta, EmailParagraph, NavpitEmailShell } from "./shell";

export type AuthResetPasswordEmailProps = { appUrl: string; confirmationUrl: string; token: string };

export function AuthResetPasswordEmail({ appUrl, confirmationUrl, token }: AuthResetPasswordEmailProps) {
  return (
    <NavpitEmailShell
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
    </NavpitEmailShell>
  );
}

AuthResetPasswordEmail.PreviewProps = {
  appUrl: "https://www.navpit.com",
  confirmationUrl: "https://www.navpit.com/nouveau-mot-de-passe",
  token: "482913",
} satisfies AuthResetPasswordEmailProps;

export default AuthResetPasswordEmail;
