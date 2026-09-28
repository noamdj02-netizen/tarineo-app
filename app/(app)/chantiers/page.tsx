import Link from "next/link";
import { ChantierGrid } from "@/components/metier/chantier-grid";
import { PageHead } from "@/components/shell/page-head";
import { buildFollowUpViews, dueCountByChantier } from "@/lib/metier/follow-ups";
import { listStoredFollowUps } from "@/lib/metier/follow-up-queries";
import { listChantiers, listDocuments } from "@/lib/metier/queries";
import { R } from "@/lib/routes";

export const metadata = { title: "Chantiers" };

export default async function ChantiersPage() {
  const [chantiers, docs, stored] = await Promise.all([listChantiers(), listDocuments(), listStoredFollowUps()]);
  const due = Object.fromEntries(dueCountByChantier(buildFollowUpViews(docs, stored)));
  return (
    <section className="flex flex-col gap-6">
      <PageHead
        label="Chantiers"
        title="Chantiers"
        crumbs={[
          { href: "/accueil", label: "Accueil" },
          { label: "Chantiers" },
        ]}
        action={
          <Link href={R.nouveauChantier} className="btn-orange inline-flex h-9 items-center px-4 text-[13.5px] font-medium">
            Nouveau chantier
          </Link>
        }
      >
        Suivez vos achats, documents et marges chantier par chantier.
      </PageHead>
      <ChantierGrid chantiers={chantiers} dueByChantier={due} />
    </section>
  );
}
