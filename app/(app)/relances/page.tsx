import { PageHead } from "@/components/shell/page-head";
import { RelancesTable } from "@/components/metier/relances-table";
import { buildFollowUpViews } from "@/lib/metier/follow-ups";
import { listStoredFollowUps } from "@/lib/metier/follow-up-queries";
import { listDocuments } from "@/lib/metier/queries";

export const metadata = { title: "Relances" };

export default async function RelancesPage() {
  const [docs, stored] = await Promise.all([listDocuments(), listStoredFollowUps()]);
  const rows = buildFollowUpViews(docs, stored);
  return (
    <section className="flex flex-col gap-6">
      <PageHead
        label="Relances"
        title="Relances"
        crumbs={[
          { href: "/accueil", label: "Accueil" },
          { label: "Relances" },
        ]}
      >
        Ne laissez plus un devis ou une demande sans réponse.
      </PageHead>
      <RelancesTable rows={rows} documents={docs} />
    </section>
  );
}
