import { PageHead, Soon } from "@/components/shell/page-head";

export const metadata = { title: "Composants" };

export default function ComposantsPage() {
  return (
    <section>
      <PageHead title="Bibliothèque de composants">
        {'Choisis un thème : tous les composants changent. Le bouton « Copier » copie le HTML. Colle aussi les tokens du thème (onglet Thèmes) pour que les variables --k-* marchent.'}
      </PageHead>
      <Soon step={6} />
    </section>
  );
}
