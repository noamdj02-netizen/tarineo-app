import { LegalPage } from "@/components/site/legal-page";
import { FOUNDER, PRO, STARTER } from "@/lib/billing/plans";
import { siteMetadata } from "@/lib/seo";

export const metadata = {
  title: "Conditions générales",
  ...siteMetadata({
    title: "Conditions générales de vente et d’utilisation",
    description: "CGV et CGU Navpit : abonnements, droits et responsabilités.",
    path: "/cgv",
  }),
};

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
            "Les offres Création, Pro et Fondateur sont détaillées sur la page Prix, avec les limites d’usage et les conditions de résiliation.",
            `Création : ${STARTER.month} € par mois ou ${STARTER.year} € par an (6 projets, 300 questions IA/mois, 100 schémas). Pro : ${PRO.month} € par mois ou ${PRO.year} € par an (projets et schémas illimités, agenda synchronisé).`,
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
