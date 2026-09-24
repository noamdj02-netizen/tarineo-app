import { ResourceLibrary } from "@/components/resources/resource-library";
import { PageHead } from "@/components/shell/page-head";
import { listResources } from "@/lib/resources/queries";

export const metadata = { title: "Ressources" };

export default async function RessourcesPage() {
  const resources = await listResources();
  return (
    <section>
      <PageHead art="dashboard-import" label="Ressources" title="Ressources design & dev," tail="au même endroit.">
        Ta Bibliothèque Notion et les meilleurs sites d’inspiration, au même endroit. Ajoute un lien
        dès que tu trouves une pépite, il est sauvegardé.
      </PageHead>
      <ResourceLibrary initial={resources} />
    </section>
  );
}
