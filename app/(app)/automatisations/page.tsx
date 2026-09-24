import { AutomationsLibrary } from "@/components/home/automations-library";
import { PageHead } from "@/components/shell/page-head";

export const metadata = {
  title: "Automatisations",
  description: "Consignes prêtes pour le copilote et raccourcis vers les modules Navpit.",
};

export default function AutomatisationsPage() {
  return (
    <section>
      <PageHead
        art="dashboard-tache-validee"
        label="Copilote"
        title="Automatisations"
        tail="et raccourcis."
      >
        Un clic envoie la consigne au copilote avec le contexte de tes projets. Tu peux aussi ouvrir
        schémas, anatomie ou ressources depuis la même page.
      </PageHead>
      <AutomationsLibrary />
    </section>
  );
}
