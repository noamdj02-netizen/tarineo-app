import { UiLibLibraryBoard } from "@/components/ui-libs/library-board";
import { PageHead } from "@/components/shell/page-head";
import { UI_LIBS } from "@/lib/ui-libs/catalog";

export const metadata = { title: "Libs UI" };

export default function UiLibsPage() {
  return (
    <section>
      <PageHead mascot="09-devis-valide" label="Libs UI" title="Bibliothèques UI," tail="gratuites.">
        Des libs externes pour accélérer une landing. On copie un prompt, pas leur code. Vérifie
        toujours la licence, surtout sur les offres Gratuit + Pro.
      </PageHead>
      <UiLibLibraryBoard libs={UI_LIBS} />
    </section>
  );
}
