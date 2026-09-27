import { LegalPage } from "@/components/site/legal-page";
import { BRAND } from "@/lib/brand";
import { siteMetadata } from "@/lib/seo";

export const metadata = {
  title: "Confidentialité",
  ...siteMetadata({
    title: "Politique de confidentialité",
    description: `Données collectées, sous-traitants, cookies et droits RGPD pour ${BRAND.name}.`,
    path: "/confidentialite",
  }),
};

export default function ConfidentialitePage() {
  return (
    <LegalPage
      title="Politique de confidentialité"
      updated="24 septembre 2026"
      sections={[
        {
          h: "Données collectées",
          p: [
            `Compte : email, prénom, mot de passe (chiffré, jamais lisible). Contenu : les documents fournisseurs que vous importez (PDF, photos) et les données qui en sont extraites (fournisseurs, produits, prix). Paiement : géré par Stripe, ${BRAND.name} ne voit jamais votre numéro de carte.`,
          ],
        },
        {
          h: "Pourquoi",
          p: [
            "Uniquement pour faire fonctionner le service (construire votre historique de prix), facturer les offres payantes et vous envoyer les emails liés à votre compte. Pas de revente, pas de publicité.",
          ],
        },
        {
          h: "Sous-traitants",
          p: [
            "Supabase (base de données et connexion), Vercel (hébergement), Stripe (paiement), Resend (emails). [À compléter : prestataire de lecture automatique des documents, le cas échéant].",
          ],
        },
        {
          h: "Durée et sécurité",
          p: [
            "Vos données sont gardées tant que votre compte existe. Chaque compte ne voit que ses propres données, grâce à une protection au niveau de la base (Row Level Security).",
          ],
        },
        {
          h: "Tes droits",
          p: [
            `Vous pouvez demander l’accès, la correction, l’export ou la suppression de vos données en écrivant à ${BRAND.contactEmail}. Vous pouvez aussi saisir la CNIL (cnil.fr).`,
          ],
        },
        {
          h: "Cookies",
          p: [
            "Cookies essentiels : session de connexion (Supabase), préférences d’interface. Ils sont nécessaires au service et ne demandent pas de consentement.",
            "Cookies de mesure (optionnels) : le conteneur Google Tag Manager est présent sur le site. Les balises (audience) ne partent qu’après « Tout accepter ». « Essentiels uniquement » les laisse bloquées.",
            "Vous pouvez retirer votre consentement en supprimant les données du site dans votre navigateur ou en nous contactant.",
          ],
        },
      ]}
    />
  );
}
