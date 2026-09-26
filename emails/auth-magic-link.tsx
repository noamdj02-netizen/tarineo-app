import { EmailCode, EmailCta, EmailParagraph, NavpitEmailShell } from "./shell";

export type AuthMagicLinkEmailProps = {
  appUrl: string;
  confirmationUrl: string;
  token: string;
};

/** Aperçu React Email — en prod Supabase envoie le HTML de scripts/auth-emails.mjs */
export function AuthMagicLinkEmail({ appUrl, confirmationUrl, token }: AuthMagicLinkEmailProps) {
  return (
    <NavpitEmailShell
      preview="Ton code de connexion Navpit"
      label="Connexion"
      title="Ton lien de connexion"
      appUrl={appUrl}
    >
      <EmailParagraph>
        Entre ce code sur la page de connexion, ou clique le bouton. Lien à usage unique, valable une heure.
      </EmailParagraph>
      <EmailCode>{token}</EmailCode>
      <EmailCta href={confirmationUrl}>Me connecter</EmailCta>
    </NavpitEmailShell>
  );
}

AuthMagicLinkEmail.PreviewProps = {
  appUrl: "https://www.navpit.com",
  confirmationUrl: "https://www.navpit.com/auth/callback",
  token: "12345678",
} satisfies AuthMagicLinkEmailProps;

export default AuthMagicLinkEmail;
