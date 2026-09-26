import { PackLibrary } from "@/components/kit2/pack-library";
import { LibrarySources } from "@/components/kit/library-sources";
import { PageHead } from "@/components/shell/page-head";

export const metadata = { title: "Composants 2" };

export default function Composants2Page() {
  return (
    <section>
      <PageHead art="onboarding-objectif" label="Composants 2" title="Composants 2," tail="niveau Framer.">
        {
          "6 styles d’après tes captures Behance. Avant de recoder un bloc : cherche-le dans Magic UI / Aceternity. Chaque carte a le code, un prompt Cursor et un prompt ChatGPT. ↺ rejoue l’animation."
        }
      </PageHead>
      <LibrarySources className="mb-8" refs={false} />
      <PackLibrary />
    </section>
  );
}
