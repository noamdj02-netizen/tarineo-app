import { LegalPage } from "@/components/site/legal-page";
import { BRAND } from "@/lib/brand";
import { siteMetadata } from "@/lib/seo";

export const metadata = {
  title: "Mentions légales",
  ...siteMetadata({
    title: "Mentions légales",
    description: `Éditeur, hébergeur et contact légal de ${BRAND.name}.`,
    path: "/mentions-legales",
  }),
};

export default function MentionsPage() {
  return (
    <LegalPage
      title="Mentions légales"
      updated="24 septembre 2026"
      sections={[
        {
          h: "Éditeur",
          p: [
            `${BRAND.name} est édité par [À compléter : nom et prénom ou raison sociale], [À compléter : statut, ex. micro-entreprise], SIRET [À compléter], dont le siège est situé [À compléter : adresse].`,
            "Directeur de la publication : [À compléter]. Contact : [À compléter : email de contact].",
          ],
        },
        {
          h: "Hébergement",
          p: [
            "Le site est hébergé par Vercel Inc., 440 N Barranca Ave #4133, Covina, CA 91723, États-Unis.",
            "Les données sont stockées par Supabase Inc. (base de données) dans la région [À compléter : région d’hébergement].",
          ],
        },
        {
          h: "Propriété intellectuelle",
          p: [
            `Les textes, illustrations, logos et le code de ${BRAND.name} sont protégés. Toute reproduction sans autorisation écrite est interdite.`,
          ],
        },
      ]}
    />
  );
}
