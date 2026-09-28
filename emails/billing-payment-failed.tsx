import { EmailCta, EmailParagraph, TarineoEmailShell } from "./shell";

export type BillingPaymentFailedEmailProps = { appUrl: string };

export function BillingPaymentFailedEmail({ appUrl }: BillingPaymentFailedEmailProps) {
  const base = appUrl.replace(/\/$/, "");
  return (
    <TarineoEmailShell
      preview="Ton paiement TARINEO n’est pas passé"
      label="Paiement"
      title="Paiement refusé"
      appUrl={appUrl}
    >
      <EmailParagraph>
        Stripe va réessayer dans quelques jours. Pour garder Pro sans coupure, vérifie ta carte bancaire.
      </EmailParagraph>
      <EmailCta href={`${base}/abonnement`}>Mettre à jour ma carte</EmailCta>
    </TarineoEmailShell>
  );
}

BillingPaymentFailedEmail.PreviewProps = { appUrl: "https://app.tarineo.com" } satisfies BillingPaymentFailedEmailProps;
export default BillingPaymentFailedEmail;
