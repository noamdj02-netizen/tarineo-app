import { EmailCta, EmailParagraph, TarineoEmailShell } from "./shell";

export type AuthEmailChangeEmailProps = { appUrl: string; confirmationUrl: string };

export function AuthEmailChangeEmail({ appUrl, confirmationUrl }: AuthEmailChangeEmailProps) {
  return (
    <TarineoEmailShell
      preview="Confirme ta nouvelle adresse TARINEO"
      label="Email"
      title="Confirme ta nouvelle adresse"
      appUrl={appUrl}
    >
      <EmailParagraph>Clique pour utiliser cette adresse email sur ton compte TARINEO.</EmailParagraph>
      <EmailCta href={confirmationUrl}>Confirmer l’adresse</EmailCta>
    </TarineoEmailShell>
  );
}

AuthEmailChangeEmail.PreviewProps = {
  appUrl: "https://app.tarineo.com",
  confirmationUrl: "https://app.tarineo.com/auth/callback",
} satisfies AuthEmailChangeEmailProps;

export default AuthEmailChangeEmail;
