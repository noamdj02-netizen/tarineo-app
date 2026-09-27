import { EmailCta, EmailParagraph, TarineoEmailShell } from "./shell";

export type BillingFounderEmailProps = { appUrl: string };

export function BillingFounderEmail({ appUrl }: BillingFounderEmailProps) {
  const base = appUrl.replace(/\/$/, "");
  return (
    <TarineoEmailShell
      preview="Merci, Fondateur !"
      label="Fondateur"
      title="Merci, Fondateur"
      appUrl={appUrl}
      footerNote="Tu fais partie des premiers : Tarinéo Pro à vie, sans abonnement. Merci de soutenir le projet dès le début."
    >
      <EmailParagraph>
        Ton paiement est reçu : tu as Tarinéo Pro à vie, sans abonnement. Merci de soutenir le projet dès le début.
      </EmailParagraph>
      <EmailCta href={`${base}/accueil`}>Ouvrir Tarinéo</EmailCta>
    </TarineoEmailShell>
  );
}

BillingFounderEmail.PreviewProps = { appUrl: "https://www.tarineo.fr" } satisfies BillingFounderEmailProps;
export default BillingFounderEmail;
