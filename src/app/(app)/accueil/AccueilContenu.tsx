import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { chargerDonneesDashboardAccueil } from "@/lib/dashboardAccueil";
import type { EtatOnboarding } from "@/lib/onboarding";
import { ObjectifDistributeur } from "../depenses/ObjectifDistributeur";
import { ExportBouton } from "../depenses/ExportBouton";
import { GraphiqueRepartitionDistributeurs } from "./AccueilCharts";
import {
  DashboardAFaire,
  DashboardAnalyseEnCours,
  DashboardBanniereReprise,
  DashboardDepensesChart,
  DashboardHeroImport,
  DashboardOverviewStats,
  DashboardRecentDocuments,
  DashboardSupplierRow,
  DashboardWeeklySavings,
} from "./DashboardSections";
import { chargerEtatQuotaUtilisateur } from "@/lib/quota";
import { MascotteDashboard } from "@/components/tarineo/MascotteDashboard";
import { Button } from "@/components/ui/button";
import { ImportDocument } from "../documents/ImportDocument";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty";
import { AccueilErreur } from "./AccueilErreur";
import { accesExportComptable } from "@/lib/planGating";
import { AppStagger, AppStaggerItem } from "@/components/tarineo/motion/AppStagger";
import { AccueilMobile } from "./AccueilMobile";

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

type Props = {
  userId: string;
  etatOnboarding: EtatOnboarding;
};

export async function AccueilContenu({ userId, etatOnboarding }: Props) {
  let donnees: Awaited<ReturnType<typeof chargerDonneesDashboardAccueil>>;
  let aVerifier = 0;
  let documentsEnCours = 0;
  let utilisateur: { plan: string | null; subscriptionStatus: string | null } | null = null;
  let etatQuota: Awaited<ReturnType<typeof chargerEtatQuotaUtilisateur>>;

  try {
    [donnees, aVerifier, documentsEnCours, utilisateur, etatQuota] = await Promise.all([
      chargerDonneesDashboardAccueil(userId),
      prisma.document.count({ where: { userId, status: "NEEDS_REVIEW" } }),
      prisma.document.count({ where: { userId, status: "PROCESSING" } }),
      prisma.user.findUnique({
        where: { id: userId },
        select: { plan: true, subscriptionStatus: true },
      }),
      chargerEtatQuotaUtilisateur(userId),
    ]);
  } catch (e) {
    console.error("Échec du rendu AccueilContenu :", e);
    return <AccueilErreur />;
  }

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
  const tableauPeuRempli =
    fournisseursTop.length === 0 &&
    documentsRecentsUi.length === 0 &&
    !aDesDepenses &&
    payloadsCount === 0 &&
    nbDocumentsMois === 0;
  const compteVide = !etatOnboarding.aDesDocuments && tableauPeuRempli;

  const enAttenteDeDonnees = tableauPeuRempli && !compteVide;

  return (
    <>
      <AccueilMobile
        economies={montantIdentifie}
        evolutionPct={evolutionPct}
        aSurveiller={donnees.aSurveiller}
        fournisseurs={fournisseursTop}
        documents={documentsRecentsUi}
        banniereReprise={etatOnboarding.doitVoirBanniereReprise}
        documentsEnCours={tableauPeuRempli ? documentsEnCours : 0}
      />

    <AppStagger className="hidden flex-col gap-8 lg:flex" stagger={0.06}>
      {etatOnboarding.doitVoirBanniereReprise && (
        <AppStaggerItem>
          <DashboardBanniereReprise etatQuota={etatQuota} />
        </AppStaggerItem>
      )}

      {(aVerifier > 0 || payloadsCount > 0) && (
        <AppStaggerItem>
          <DashboardAFaire aVerifier={aVerifier} hausses={payloadsCount} moisCourantStr={moisCourantStr} />
        </AppStaggerItem>
      )}

      {!etatOnboarding.doitVoirBanniereReprise && (
        <AppStaggerItem>
          <DashboardHeroImport
            compteVide={compteVide}
            enAttenteDeDonnees={enAttenteDeDonnees}
            etatQuota={etatQuota}
            documentsEnCours={documentsEnCours}
          />
        </AppStaggerItem>
      )}

      {tableauPeuRempli && (
        <AppStaggerItem>
          <DashboardAnalyseEnCours documentsEnCours={documentsEnCours} />
        </AppStaggerItem>
      )}

      {!compteVide && !tableauPeuRempli && (
        <AppStaggerItem>
          <DashboardSupplierRow fournisseurs={fournisseursTop} />
        </AppStaggerItem>
      )}

      {!tableauPeuRempli && (
        <AppStaggerItem>
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
        </AppStaggerItem>
      )}

      {!tableauPeuRempli && (
        <AppStaggerItem>
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
                    <EmptyMedia>
                      <MascotteDashboard variant="pouceLeve" />
                    </EmptyMedia>
                    <EmptyTitle>Aucune hausse détectée</EmptyTitle>
                    <EmptyDescription>
                      Continuez à importer : dès qu&apos;un même produit revient à un prix plus élevé, Tarinéo
                      l&apos;affiche ici.
                    </EmptyDescription>
                  </EmptyHeader>
                </Empty>
              )}
            </CardContent>
          </Card>
        </div>
        </AppStaggerItem>
      )}

      {!tableauPeuRempli && (
        <AppStaggerItem>
        <div className="flex flex-wrap justify-center gap-3 pt-2">
          <ImportDocument label="Importer un document" className="h-auto rounded-full px-6 py-3" />
          <Button render={<Link prefetch={false} href="/documents" />} variant="outline" className="h-auto rounded-full px-6 py-3">
            Voir mes documents
          </Button>
          <Button
            variant="outline"
            render={<Link prefetch={false} href="/devis-clients/nouveau" />}
            className="h-auto rounded-full px-6 py-3"
          >
            Créer un devis client
          </Button>
        </div>
        </AppStaggerItem>
      )}

      {!tableauPeuRempli && (
        <AppStaggerItem>
        <section id="objectifs" className="app-card scroll-mt-24 p-5 sm:p-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <h2 className="app-display text-lg font-semibold text-[var(--foreground)] sm:text-xl">Vos objectifs</h2>
              <p className="mt-1 max-w-xl text-sm text-muted-foreground">
                Dépenses réelles par distributeur avec objectif facultatif par fournisseur.
              </p>
            </div>
            <ExportBouton
              distributeurs={[...distributeursOptions.entries()].map(([norm, label]) => ({ norm, label }))}
              accesExport={accesExportComptable(utilisateur?.plan ?? null, utilisateur?.subscriptionStatus ?? null)}
            />
          </div>

          {depenses.length === 0 ? (
            <Empty className="mt-6 border-0">
              <EmptyHeader>
                <EmptyMedia>
                  <MascotteDashboard variant="brasCroises" />
                </EmptyMedia>
                <EmptyTitle>Aucun achat validé</EmptyTitle>
                <EmptyDescription>
                  Les factures et bons validés apparaîtront ici dès que vous en aurez importé et validé.
                </EmptyDescription>
              </EmptyHeader>
            </Empty>
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
        </AppStaggerItem>
      )}
    </AppStagger>
    </>
  );
}
