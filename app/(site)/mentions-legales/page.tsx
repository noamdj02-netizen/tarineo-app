import { LegalPage } from "@/components/site/legal-page";
import { BRAND } from "@/lib/brand";
import {
  LEGAL_PUBLISHER,
  publisherEditorParagraph,
  publisherPublicationDirectorLine,
  publisherSupabaseDataRegion,
} from "@/lib/legal/publisher";
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
      updated={LEGAL_PUBLISHER.legalPagesUpdated}
      sections={[
        {
          h: "Éditeur",
          p: [publisherEditorParagraph(), publisherPublicationDirectorLine()],
        },
        {
          h: "Hébergement",
          p: [
            "Le site est hébergé par Vercel Inc., 440 N Barranca Ave #4133, Covina, CA 91723, États-Unis.",
            `Les données d’usage et les comptes sont stockés par Supabase Inc. (base de données) dans la région ${publisherSupabaseDataRegion()}.`,
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
