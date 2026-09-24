import { ProjectGrid } from "@/components/projects/project-grid";
import { PageHead } from "@/components/shell/page-head";
import { listProjects } from "@/lib/projects/queries";

export const metadata = { title: "Projets" };

export default async function ProjetsPage() {
  const projects = await listProjects();
  return (
    <section>
      <PageHead art="dashboard-focus" label="Projets" title="Mes projets" tail="un seul en Focus.">
        Règle Mon Bureau : un seul projet en Focus tant qu’il n’a pas fait sa première vente.
        Chaque carte montre l’étape (1 à 6), la prochaine action et tous les liens.
      </PageHead>
      <ProjectGrid projects={projects} />
    </section>
  );
}
