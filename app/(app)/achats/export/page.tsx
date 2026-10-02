import { AccountingExportPageClient } from "@/components/tarineo/panels/accounting-export-page-client";
import { PageHead } from "@/components/shell/page-head";
import {
  listAccountingExportRuns,
  listAccountingExportSchedules,
} from "@/lib/metier/accounting-export-queries";
import { getCompanyProfile, listDocuments, rankingRows } from "@/lib/metier/queries";

export const metadata = { title: "Export comptable" };

export default async function AchatsExportPage() {
  const [documents, ranking, schedules, runs, company] = await Promise.all([
    listDocuments(),
    rankingRows(),
    listAccountingExportSchedules(),
    listAccountingExportRuns(20),
    getCompanyProfile(),
  ]);
  const invoiceCount = documents.filter((d) => d.kind === "facture").length;
  const activeSchedules = schedules.filter((s) => s.enabled).length;
  const lastExportLabel = runs[0]
    ? new Date(runs[0].created_at).toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric" })
    : null;

  return (
    <section className="flex flex-col gap-8 pb-10">
      <PageHead
        label="Achats"
        title="Export comptable"
        crumbs={[
          { href: "/accueil", label: "Accueil" },
          { href: "/achats", label: "Achats" },
          { label: "Export" },
        ]}
      >
        Filtrez vos factures, téléchargez un CSV ou programmez l’envoi à votre comptable.
      </PageHead>
      <AccountingExportPageClient
        documents={documents}
        enseignes={ranking.enseignes}
        schedules={schedules}
        runs={runs}
        defaultEmail={company?.email_contact ?? ""}
        invoiceCount={invoiceCount}
        activeSchedules={activeSchedules}
        lastExportLabel={lastExportLabel}
      />
    </section>
  );
}
