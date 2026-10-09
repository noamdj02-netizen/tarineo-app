import { PageHead } from "@/components/shell/page-head";
import { RelancesTable } from "@/components/metier/relances-table";
import { buildFollowUpViews } from "@/lib/metier/follow-ups";
import { listStoredFollowUps } from "@/lib/metier/follow-up-queries";
import { listDocuments } from "@/lib/metier/queries";

export const metadata = { title: "Relances" };

export default async function RelancesPage() {
  const [docs, stored] = await Promise.all([listDocuments(), listStoredFollowUps()]);
  const rows = buildFollowUpViews(docs, stored);
  const due = rows.filter((r) => r.status === "due").length;
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
        {due
          ? `${due} devis ou demande${due > 1 ? "s" : ""} à relancer — un mail, puis vous passez au suivant.`
          : "Les devis envoyés sans suite apparaissent ici. Relancez en un clic ou programmez un rappel."}
      </PageHead>
      <RelancesTable rows={rows} documents={docs} />
    </section>
  );
}
