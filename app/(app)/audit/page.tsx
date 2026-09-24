import { PageHead, Soon } from "@/components/shell/page-head";

export const metadata = { title: "Audit de tes 3 sites · Studio Noam" };

export default function AuditPage() {
  return (
    <section>
      <PageHead title="Audit de tes 3 sites">
        {'Chaque site est comparé aux 12 frames. Vert = présent, orange = à améliorer, rouge = manquant. Audit fait sur le contenu public des pages le 24/09/2026.'}
      </PageHead>
      <Soon step={6} />
    </section>
  );
}
