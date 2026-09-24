import { LegalPage } from "@/components/site/legal-page";
import { FOUNDER, LOYALTY_TIERS } from "@/lib/billing/plans";
import { siteMetadata } from "@/lib/seo";

export const metadata = {
  title: "Conditions générales",
  ...siteMetadata({
    title: "Conditions générales de vente et d’utilisation",
    description: "CGV et CGU Navpit : abonnements, droits et responsabilités.",
    path: "/cgv",
  }),
};

const [y1, y2, y3] = LOYALTY_TIERS;

export default function CgvPage() {
  return (
    <LegalPage
      title="Conditions générales d’utilisation et de vente"
      updated="24 septembre 2026"
      sections={[
        {
          h: "1. Objet",
          p: [
            "Ces conditions encadrent l’utilisation de Navpit, un logiciel en ligne qui aide les fondateurs à organiser leurs projets, et la souscription aux offres payantes.",
          ],
        },
        {
          h: "2. Compte",
          p: [
            "Tu crées un compte avec une adresse email valide ou un compte Google. Tu es responsable de la confidentialité de ton mot de passe et de l’usage de ton compte.",
          ],
        },
        {
          h: "3. Offres et prix",
          p: [
            "Le plan Gratuit est sans engagement et sans carte bancaire, avec des limites d’usage indiquées sur la page Prix.",
            `Le plan Pro est un abonnement mensuel ou annuel. Son prix suit un barème de fidélité : ${y1.month} € par mois (ou ${y1.year} € par an) la première année, ${y2.month} € (ou ${y2.year} €) la deuxième, puis ${y3.month} € (ou ${y3.year} €) à partir de la troisième année d’abonnement sans interruption. En cas de résiliation, l’ancienneté repart de zéro.`,
            `L’offre Fondateur est un paiement unique de ${FOUNDER.price} € donnant accès au plan Pro pour la durée de vie du service, limitée aux ${FOUNDER.seats} premiers clients.`,
            "Les prix sont indiqués en euros, [À compléter : TTC ou « TVA non applicable, art. 293 B du CGI » selon ton statut].",
          ],
        },
        {
          h: "4. Paiement et renouvellement",
          p: [
            "Le paiement est traité par Stripe. L’abonnement se renouvelle automatiquement à chaque période. Tu peux résilier à tout moment depuis la page Abonnement : l’accès Pro reste actif jusqu’à la fin de la période payée.",
          ],
        },
        {
          h: "5. Droit de rétractation",
          p: [
            "En accédant immédiatement au service payant, tu demandes expressément son exécution avant la fin du délai de rétractation de 14 jours et tu renonces à ce droit, conformément à l’article L221-28 du Code de la consommation.",
          ],
        },
        {
          h: "6. Usage acceptable et limites",
          p: [
            "Le copilote IA est soumis à un quota mensuel. Tout usage abusif (automatisation, revente, contournement des limites) peut entraîner la suspension du compte.",
          ],
        },
        {
          h: "7. Responsabilité",
          p: [
            "Navpit est fourni en l’état. Les réponses de l’IA peuvent contenir des erreurs : vérifie-les avant de t’en servir. L’éditeur ne peut être tenu responsable des décisions prises sur leur base.",
          ],
        },
        {
          h: "8. Droit applicable",
          p: ["Ces conditions sont soumises au droit français. Contact : [À compléter : email]."],
        },
      ]}
    />
  );
}
