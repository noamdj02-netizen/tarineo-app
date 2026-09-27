import { EmailCta, EmailParagraph, TarineoEmailShell } from "./shell";

export type AuthEmailChangeEmailProps = { appUrl: string; confirmationUrl: string };

export function AuthEmailChangeEmail({ appUrl, confirmationUrl }: AuthEmailChangeEmailProps) {
  return (
    <TarineoEmailShell
      preview="Confirme ta nouvelle adresse Tarinéo"
      label="Email"
      title="Confirme ta nouvelle adresse"
      appUrl={appUrl}
    >
      <EmailParagraph>Clique pour utiliser cette adresse email sur ton compte Tarinéo.</EmailParagraph>
      <EmailCta href={confirmationUrl}>Confirmer l’adresse</EmailCta>
    </TarineoEmailShell>
  );
}

AuthEmailChangeEmail.PreviewProps = {
  appUrl: "https://www.tarineo.fr",
  confirmationUrl: "https://www.tarineo.fr/auth/callback",
} satisfies AuthEmailChangeEmailProps;

export default AuthEmailChangeEmail;
