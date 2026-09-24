import { PageHead, Soon } from "@/components/shell/page-head";

export const metadata = { title: "Assistant IA" };

export default function AssistantPage() {
  return (
    <section>
      <PageHead label="Assistant IA" title="Ton copilote" tail="qui connaît tes projets.">
        {
          "Il connaît tes projets, tes ressources, tes 6 thèmes et la méthode landing de cette page. Demande-lui un prompt Cursor, un choix de thème ou une section à écrire."
        }
      </PageHead>
      <Soon step={4} />
    </section>
  );
}
