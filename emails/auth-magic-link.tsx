import { Text } from "@react-email/components";
import { EmailCta, EmailParagraph, NavpitEmailShell } from "./shell";

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
      <EmailParagraph>Colle ce code sur la page de connexion, ou utilise le bouton (lien à usage unique, ~1 h).</EmailParagraph>
      <Text className="m-0 font-display text-[32px] font-semibold tracking-[0.2em] text-ink">{token}</Text>
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
