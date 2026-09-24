import { EmailParagraph, NavpitEmailShell } from "./shell";

export type BillingLoyaltyEmailProps = {
  appUrl: string;
  price: number;
  intervalLabel: "par mois" | "par an";
  yearsLabel: string;
};

export function BillingLoyaltyEmail({ appUrl, price, intervalLabel, yearsLabel }: BillingLoyaltyEmailProps) {
  return (
    <NavpitEmailShell
      preview={`Ton prix Navpit Pro baisse à ${price} €`}
      label="Prix fidélité"
      title={`Ton prix passe à ${price} € ${intervalLabel}`}
      appUrl={appUrl}
    >
      <EmailParagraph>
        Tu es abonné à Navpit Pro depuis {yearsLabel}. Comme promis, ton prix baisse dès ta prochaine facture, sans rien
        faire. Merci de ta confiance.
      </EmailParagraph>
    </NavpitEmailShell>
  );
}

BillingLoyaltyEmail.PreviewProps = {
  appUrl: "https://www.navpit.com",
  price: 12,
  intervalLabel: "par mois",
  yearsLabel: "un an",
} satisfies BillingLoyaltyEmailProps;

export default BillingLoyaltyEmail;
