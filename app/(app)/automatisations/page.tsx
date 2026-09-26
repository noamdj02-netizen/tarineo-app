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
        Débrief Focus, prochaine action et schéma parcours écrivent dans Navpit. Les autres lancent
        le copilote. Schémas, anatomie et ressources restent à un clic.
      </PageHead>
      <AutomationsLibrary />
    </section>
  );
}
