import { PageHead, Soon } from "@/components/shell/page-head";

export const metadata = { title: "Ressources design & dev · Studio Noam" };

export default function RessourcesPage() {
  return (
    <section>
      <PageHead title="Ressources design & dev">
        {'Ta Bibliothèque Notion et les meilleurs sites d’inspiration, au même endroit. Ajoute un lien dès que tu trouves une pépite, il est sauvegardé.'}
      </PageHead>
      <Soon step={5} />
    </section>
  );
}
