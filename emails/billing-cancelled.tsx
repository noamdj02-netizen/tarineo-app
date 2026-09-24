import { EmailCta, EmailParagraph, NavpitEmailShell } from "./shell";

export type BillingCancelledEmailProps = { appUrl: string; endDate?: string };

export function BillingCancelledEmail({ appUrl, endDate }: BillingCancelledEmailProps) {
  const base = appUrl.replace(/\/$/, "");
  return (
    <NavpitEmailShell
      preview="Ton abonnement Navpit Pro se termine"
      label="Abonnement"
      title="Abonnement annulé"
      appUrl={appUrl}
    >
      <EmailParagraph>
        {endDate
          ? `Ton accès Pro reste actif jusqu’au ${endDate}. Ensuite tu repasses sur le plan gratuit.`
          : "Ton abonnement Pro est terminé. Tu peux toujours utiliser Navpit en version gratuite."}
      </EmailParagraph>
      <EmailCta href={`${base}/abonnement`}>Gérer mon abonnement</EmailCta>
    </NavpitEmailShell>
  );
}

BillingCancelledEmail.PreviewProps = {
  appUrl: "https://www.navpit.com",
  endDate: "12 avril 2026",
} satisfies BillingCancelledEmailProps;

export default BillingCancelledEmail;
