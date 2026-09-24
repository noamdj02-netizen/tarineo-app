import { PackLibrary } from "@/components/kit2/pack-library";
import { PageHead } from "@/components/shell/page-head";

export const metadata = { title: "Composants 2" };

export default function Composants2Page() {
  return (
    <section>
      <PageHead art="onboarding-objectif" label="Composants 2" title="Composants 2," tail="niveau Framer.">
        {
          "6 styles refaits d’après tes captures Behance : ombres douces, reflets, animations. Pour chaque bloc : le code complet, un prompt Cursor / Claude Code (React + Tailwind + framer-motion) et un prompt ChatGPT. Le bouton ↺ rejoue l’animation."
        }
      </PageHead>
      <PackLibrary />
    </section>
  );
}
