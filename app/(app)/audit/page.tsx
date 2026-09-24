import { PageHead, Soon } from "@/components/shell/page-head";

export const metadata = { title: "Mes sites" };

export default function AuditPage() {
  return (
    <section>
      <PageHead label="Mes sites" title="Audit de tes 3 sites," tail="face aux 12 frames.">
        {
          "Chaque site est comparé aux 12 frames. Vert = présent, orange = à améliorer, rouge = manquant. Audit fait sur le contenu public des pages le 24/09/2026."
        }
      </PageHead>
      <Soon step={6} />
    </section>
  );
}
