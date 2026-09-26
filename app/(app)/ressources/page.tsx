import { ResourceLibrary } from "@/components/resources/resource-library";
import { PageHead } from "@/components/shell/page-head";
import { listResources } from "@/lib/resources/queries";

export const metadata = { title: "Ressources" };

export default async function RessourcesPage() {
  const resources = await listResources();
  return (
    <section>
      <PageHead art="dashboard-import" label="Ressources" title="Le tiroir design," tail="déjà rempli.">
        Cinq librairies à copier avant de coder. Ensuite les références, tes liens, une recherche.
      </PageHead>
      <ResourceLibrary initial={resources} />
    </section>
  );
}
