import { EmailCta, EmailParagraph, NavpitEmailShell } from "./shell";

export type BillingFounderEmailProps = { appUrl: string };

export function BillingFounderEmail({ appUrl }: BillingFounderEmailProps) {
  const base = appUrl.replace(/\/$/, "");
  return (
    <NavpitEmailShell
      preview="Merci, Fondateur !"
      label="Fondateur"
      title="Merci, Fondateur"
      appUrl={appUrl}
      footerNote="Tu fais partie des premiers : Navpit Pro à vie, sans abonnement. Merci de soutenir le projet dès le début."
    >
      <EmailParagraph>
        Ton paiement est reçu : tu as Navpit Pro à vie, sans abonnement. Merci de soutenir le projet dès le début.
      </EmailParagraph>
      <EmailCta href={`${base}/accueil`}>Ouvrir Navpit</EmailCta>
    </NavpitEmailShell>
  );
}

BillingFounderEmail.PreviewProps = { appUrl: "https://www.navpit.com" } satisfies BillingFounderEmailProps;
export default BillingFounderEmail;
