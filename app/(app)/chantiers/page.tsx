import { ChantierGrid } from "@/components/metier/chantier-grid";
import { PageHead } from "@/components/shell/page-head";
import { listChantiers } from "@/lib/metier/queries";
import { APP_PAGES } from "@/lib/site/app-pages";

export const metadata = { title: "Chantiers" };

export default async function ChantiersPage() {
  const chantiers = await listChantiers();
  const p = APP_PAGES.chantiers;
  return (
    <section className="flex flex-col gap-8">
      <PageHead mascot="11-equipe" label={p.label} title={p.title} tail={p.tail}>
        {p.text}
      </PageHead>
      <ChantierGrid chantiers={chantiers} />
    </section>
  );
}
