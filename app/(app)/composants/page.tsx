import { LucideByName } from "@/components/icons/lucide-by-name";
import { ComponentLibrary } from "@/components/kit/component-library";
import { PageHead } from "@/components/shell/page-head";
import { COMPONENTS } from "@/lib/design-data/components";
import { THEMES } from "@/lib/design-data/themes";

export const metadata = { title: "Composants" };

export default async function ComposantsPage({
  searchParams,
}: {
  searchParams: Promise<{ theme?: string }>;
}) {
  const { theme } = await searchParams;
  const initialTheme = THEMES.some((t) => t.id === theme) ? theme : undefined;

  return (
    <section>
      <PageHead label="Composants" title="Bibliothèque" tail="de composants.">
        {
          "Choisis un thème : tous les composants changent. Le bouton « Copier » copie le HTML. Colle aussi les tokens du thème (onglet Thèmes) pour que les variables --k-* marchent."
        }
      </PageHead>
      <ComponentLibrary
        key={initialTheme}
        initialTheme={initialTheme}
        icons={COMPONENTS.map((c) => (
          <LucideByName key={c.ic} name={c.ic} />
        ))}
      />
    </section>
  );
}
