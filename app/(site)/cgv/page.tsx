import { LegalPage } from "@/components/site/legal-page";
import { BRAND } from "@/lib/brand";
import { LEGAL_PUBLISHER, publisherCgvProviderLine } from "@/lib/legal/publisher";
import { PRICING } from "@/lib/site/tarineo";
import { siteMetadata } from "@/lib/seo";

export const metadata = {
  title: "Conditions générales",
  ...siteMetadata({
    title: "Conditions générales de vente et d’utilisation",
    description: `CGV et CGU ${BRAND.name} : abonnements, droits et responsabilités.`,
    path: "/cgv",
  }),
};

export default function CgvPage() {
  return (
    <LegalPage
      title="Conditions générales d’utilisation et de vente"
      updated={LEGAL_PUBLISHER.legalPagesUpdated}
      sections={[
        {
          h: "1. Objet",
          p: [
            `Ces conditions encadrent l’utilisation de ${BRAND.name}, un logiciel en ligne qui analyse les devis et factures fournisseurs des professionnels du bâtiment pour suivre l’évolution de leurs prix d’achat, et la souscription aux offres payantes.`,
            publisherCgvProviderLine(),
          ],
        },
        {
          h: "2. Compte",
          p: [
            "Vous créez un compte avec une adresse email valide ou un compte Google. Vous êtes responsable de la confidentialité de votre mot de passe et de l’usage de votre compte.",
          ],
        },
        {
          h: "3. Offres et prix",
          p: [
            `Les offres ${PRICING.map((p) => p.name).join(", ")} sont détaillées sur la page Tarifs. Tout changement de tarif est annoncé avant d’être appliqué.`,
            PRICING.map((p) => `${p.name} : ${p.month} € HT par mois ou ${p.year} € HT par an`).join(" · ") + ". Le premier mois est offert.",
            LEGAL_PUBLISHER.pricesVatNote,
          ],
        },
        {
          h: "4. Paiement et renouvellement",
          p: [
            "Le paiement est traité par Stripe. L’abonnement se renouvelle automatiquement à chaque période. Vous pouvez résilier à tout moment depuis votre compte : l’accès reste actif jusqu’à la fin de la période payée.",
          ],
        },
        {
          h: "5. Droit de rétractation",
          p: [LEGAL_PUBLISHER.professionalWithdrawalNote],
        },
        {
          h: "6. Usage acceptable et limites",
          p: [
            "Chaque offre comporte un volume d’analyses. Tout usage abusif (automatisation, revente, contournement des limites) peut entraîner la suspension du compte.",
          ],
        },
        {
          h: "7. Responsabilité",
          p: [
            `${BRAND.name} est fourni en l’état. La lecture automatique des documents peut contenir des erreurs : vérifiez les montants avant de vous en servir. ${LEGAL_PUBLISHER.legalName} ne peut être tenu responsable des décisions prises sur leur base.`,
          ],
        },
        {
          h: "8. Droit applicable",
          p: [`Ces conditions sont soumises au droit français. Contact : ${BRAND.contactEmail}.`],
        },
      ]}
    />
  );
}
