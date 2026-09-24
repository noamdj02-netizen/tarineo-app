import { PageHead, Soon } from "@/components/shell/page-head";

export const metadata = { title: "Ressources" };

export default function RessourcesPage() {
  return (
    <section>
      <PageHead label="Ressources" title="Ressources design & dev," tail="au même endroit.">
        {
          "Ta Bibliothèque Notion et les meilleurs sites d’inspiration, au même endroit. Ajoute un lien dès que tu trouves une pépite, il est sauvegardé."
        }
      </PageHead>
      <Soon step={5} />
    </section>
  );
}
