import { HeroLibraryBoard } from "@/components/heroes/library-board";
import { PageHead } from "@/components/shell/page-head";
import { listHeroes } from "@/lib/heroes/queries";
import { listProjects } from "@/lib/projects/queries";

export const metadata = { title: "Heros" };

export default async function HeroLibraryPage() {
  const [heroes, projects] = await Promise.all([listHeroes(), listProjects()]);
  return (
    <section>
      <PageHead art="dashboard-devis" label="Heros" title="Ta landing," tail="en cinq minutes.">
        Choisis une page, ajoute-la à ton projet, envoie le projet à Cursor, Claude ou au copilote.
        Couleurs vraies, photo vraie, CTA vrai — pas un void noir.
      </PageHead>
      <HeroLibraryBoard
        heroes={heroes}
        projects={projects.map((p) => ({
          id: p.id,
          slug: p.slug,
          name: p.name,
          status: p.status,
        }))}
      />
    </section>
  );
}
