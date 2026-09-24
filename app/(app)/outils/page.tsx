import { PageHead, Soon } from "@/components/shell/page-head";

export const metadata = { title: "Tes outils · Studio Noam" };

export default function OutilsPage() {
  return (
    <section>
      <PageHead title="Tes outils">
        {'Tous tes logiciels avec leurs vrais logos, rangés par étape de création d’un SaaS.'}
      </PageHead>
      <Soon step={5} />
    </section>
  );
}
