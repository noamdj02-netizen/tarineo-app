import { redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "@/auth";
import { chargerDonneesDashboardAccueil } from "@/lib/dashboardAccueil";
import { ObjectifDistributeur } from "../depenses/ObjectifDistributeur";
import { ExportBouton } from "../depenses/ExportBouton";
import { GraphiqueRepartitionDistributeurs } from "./AccueilCharts";
import {
  DashboardDepensesChart,
  DashboardOverviewStats,
  DashboardRecentDocuments,
  DashboardSupplierRow,
  DashboardWeeklySavings,
} from "./DashboardSections";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Empty, EmptyDescription, EmptyHeader, EmptyTitle } from "@/components/ui/empty";

const MOIS_FR = [
  "janvier",
  "février",
  "mars",
  "avril",
  "mai",
  "juin",
  "juillet",
  "août",
  "septembre",
  "octobre",
  "novembre",
  "décembre",
];

function periodeLabel(mois: number, jour: number): string {
  if (mois === 1 && jour === 1) return "Année civile";
  return `Période à partir du ${jour} ${MOIS_FR[mois - 1]}`;
}

export default async function AccueilPage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/connexion");
  }

  const maintenant = new Date();
  const donnees = await chargerDonneesDashboardAccueil(session.user.id);

  const {
    nbDocumentsMois,
    pourcentageMoyenHausse,
    montantIdentifie,
    payloadsCount,
    fournisseursTop,
    documentsRecentsUi,
    totalSemaine,
    evolutionPct,
    donneesSemaine,
    evolutionDepenses,
    aDesDepenses,
    repartitionParDistributeur,
    depenses,
    distributeursOptions,
    moisCourantStr,
  } = donnees;

  const distributeursAvecObjectif = depenses.filter((d) => d.objectif !== null);
  const distributeursSansObjectif = depenses.filter((d) => d.objectif === null);

  const prenom = (session.user.name?.split(" ")[0] ?? "Artisan").replace(/^./, (c) => c.toUpperCase());
  const dateLabel = maintenant.toLocaleDateString("fr-FR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <div className="w-full min-w-0 py-0">
      <header className="mb-6 lg:hidden">
        <p className="text-[28px] leading-[1.15] text-foreground sm:text-[32px]">
          <span className="font-normal">Bon retour, </span>
          <span className="font-medium">{prenom}</span>
        </p>
        <p className="mt-2 text-sm capitalize text-[var(--muted)]">{dateLabel}</p>
      </header>

      <div className="flex flex-col gap-8">
        <DashboardSupplierRow fournisseurs={fournisseursTop} />

        <div className="grid min-w-0 grid-cols-1 gap-6 xl:grid-cols-[minmax(0,425px)_minmax(0,1fr)]">
          <DashboardRecentDocuments documents={documentsRecentsUi} />
          <div className="flex min-w-0 flex-col gap-6">
            <DashboardWeeklySavings
              totalSemaine={totalSemaine}
              evolutionPct={evolutionPct}
              donneesSemaine={donneesSemaine}
            />
            <DashboardOverviewStats
              nbDocumentsMois={nbDocumentsMois}
              hausseMoyenne={pourcentageMoyenHausse}
              economiesPotentielles={montantIdentifie}
              moisCourantStr={moisCourantStr}
              payloadsCount={payloadsCount}
            />
          </div>
        </div>

        <div className="grid min-w-0 gap-6 lg:grid-cols-2">
          <DashboardDepensesChart donnees={evolutionDepenses} aDesDepenses={aDesDepenses} />
          <Card className="min-w-0 rounded-[24px] ring-0">
            <CardHeader>
              <CardTitle className="text-xl">Hausses par distributeur (12 mois)</CardTitle>
            </CardHeader>
            <CardContent>
              {repartitionParDistributeur.length > 0 ? (
                <GraphiqueRepartitionDistributeurs donnees={repartitionParDistributeur} />
              ) : (
                <Empty>
                  <EmptyHeader>
                    <EmptyTitle>Aucune hausse détectée</EmptyTitle>
                    <EmptyDescription>Rien à signaler sur les 12 derniers mois.</EmptyDescription>
                  </EmptyHeader>
                </Empty>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="flex justify-center pt-2">
          <Button render={<Link href="/documents" />} className="h-auto rounded-full px-6 py-3">
            Voir mes documents
          </Button>
        </div>

        <section id="objectifs" className="app-card scroll-mt-24 p-5 sm:p-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <h2 className="app-display text-lg font-semibold text-[var(--foreground)] sm:text-xl">Vos objectifs</h2>
              <p className="mt-1 max-w-xl text-sm text-[var(--muted)]">
                Dépenses réelles par distributeur avec objectif facultatif par fournisseur.
              </p>
            </div>
            <ExportBouton distributeurs={[...distributeursOptions.entries()].map(([norm, label]) => ({ norm, label }))} />
          </div>

          {depenses.length === 0 ? (
            <p className="mt-6 text-sm text-[var(--muted)]">
              Aucun achat validé pour l&apos;instant. Les factures et bons validés apparaîtront ici.
            </p>
          ) : (
            <>
              {distributeursAvecObjectif.length > 0 && (
                <div className="mt-6">
                  <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-[var(--accent)]">
                    Objectifs en cours
                  </p>
                  <div className="grid gap-4 sm:grid-cols-2">
                    {distributeursAvecObjectif.map((d) => (
                      <ObjectifDistributeur
                        key={d.distributorNorm}
                        distributor={d.distributor}
                        distributorNorm={d.distributorNorm}
                        depenses={d.depenses}
                        objectif={d.objectif}
                        periodStartMonth={d.periodStartMonth}
                        periodStartDay={d.periodStartDay}
                        pourcentageAtteinte={d.pourcentageAtteinte}
                        encoursRestant={d.encoursRestant}
                        periodeLabel={periodeLabel(d.periodStartMonth, d.periodStartDay)}
                      />
                    ))}
                  </div>
                </div>
              )}

              {distributeursSansObjectif.length > 0 && (
                <div className={distributeursAvecObjectif.length > 0 ? "mt-8" : "mt-6"}>
                  <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-[var(--accent)]">
                    Sans objectif défini
                  </p>
                  <div className="grid gap-4 sm:grid-cols-2">
                    {distributeursSansObjectif.map((d) => (
                      <ObjectifDistributeur
                        key={d.distributorNorm}
                        distributor={d.distributor}
                        distributorNorm={d.distributorNorm}
                        depenses={d.depenses}
                        objectif={d.objectif}
                        periodStartMonth={d.periodStartMonth}
                        periodStartDay={d.periodStartDay}
                        pourcentageAtteinte={d.pourcentageAtteinte}
                        encoursRestant={d.encoursRestant}
                        periodeLabel={periodeLabel(d.periodStartMonth, d.periodStartDay)}
                      />
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </section>
      </div>
    </div>
  );
}
