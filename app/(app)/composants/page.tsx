import { LucideByName } from "@/components/icons/lucide-by-name";
import { ComponentLibrary } from "@/components/kit/component-library";
import { LibrarySources } from "@/components/kit/library-sources";
import { PageHead } from "@/components/shell/page-head";
import { COMPONENTS } from "@/lib/design-data/components";
import { listProjects } from "@/lib/projects/queries";
import { THEMES } from "@/lib/design-data/themes";

export const metadata = { title: "Composants" };

export default async function ComposantsPage({
  searchParams,
}: {
  searchParams: Promise<{ theme?: string }>;
}) {
  const { theme } = await searchParams;
  const initialTheme = THEMES.some((t) => t.id === theme) ? theme : undefined;
  const projects = await listProjects();

  return (
    <section>
      <PageHead art="dashboard-devis" label="Composants" title="Bibliothèque" tail="de composants.">
        {
          "D’abord Magic UI, Aceternity, HyperUI ou daisyUI. Ensuite seulement du from scratch. Choisis un thème : tous les aperçus changent. Copier colle le HTML + les tokens (onglet Thèmes)."
        }
      </PageHead>
      <LibrarySources className="mb-8" refs={false} />
      <ComponentLibrary
        key={initialTheme}
        initialTheme={initialTheme}
        projects={projects.map((p) => ({
          id: p.id,
          slug: p.slug,
          name: p.name,
          status: p.status,
        }))}
        icons={COMPONENTS.map((c) => (
          <LucideByName key={c.ic} name={c.ic} />
        ))}
      />
    </section>
  );
}
