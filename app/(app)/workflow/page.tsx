import { PageHead, Soon } from "@/components/shell/page-head";

export const metadata = { title: "Figma → Cursor" };

export default function WorkflowPage() {
  return (
    <section>
      <PageHead title="Figma → Cursor, sans perte">
        {'Pourquoi le code ne ressemble jamais à ta maquette, et la méthode en 7 étapes pour que ça marche.'}
      </PageHead>
      <Soon step={6} />
    </section>
  );
}
