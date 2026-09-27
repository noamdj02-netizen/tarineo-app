import { EmailParagraph, TarineoEmailShell } from "./shell";

export type BillingLoyaltyEmailProps = {
  appUrl: string;
  price: number;
  intervalLabel: "par mois" | "par an";
  yearsLabel: string;
};

export function BillingLoyaltyEmail({ appUrl, price, intervalLabel, yearsLabel }: BillingLoyaltyEmailProps) {
  return (
    <TarineoEmailShell
      preview={`Ton prix Tarinéo baisse à ${price} €`}
      label="Prix fidélité"
      title={`Ton prix passe à ${price} € ${intervalLabel}`}
      appUrl={appUrl}
    >
      <EmailParagraph>
        Tu es abonné à Tarinéo Pro depuis {yearsLabel}. Comme promis, ton prix baisse dès ta prochaine facture, sans rien
        faire. Merci de ta confiance.
      </EmailParagraph>
    </TarineoEmailShell>
  );
}

BillingLoyaltyEmail.PreviewProps = {
  appUrl: "https://www.tarineo.fr",
  price: 12,
  intervalLabel: "par mois",
  yearsLabel: "un an",
} satisfies BillingLoyaltyEmailProps;

export default BillingLoyaltyEmail;
