import { PageHead, Soon } from "@/components/shell/page-head";

export const metadata = { title: "Projets" };

export default function ProjetsPage() {
  return (
    <section>
      <PageHead label="Projets" title="Mes projets" tail="un seul en Focus.">
        {
          "Règle Mon Bureau : un seul projet en Focus tant qu’il n’a pas fait sa première vente. Chaque carte montre l’étape (1 à 6), la prochaine action et tous les liens."
        }
      </PageHead>
      <Soon step={3} />
    </section>
  );
}
