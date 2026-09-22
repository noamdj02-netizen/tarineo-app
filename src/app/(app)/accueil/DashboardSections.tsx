import Image from "next/image";
import Link from "next/link";
import { ArrowUpRightIcon, StarIcon } from "lucide-react";
import { BadgeHaussePrix } from "@/components/tarineo/BadgeStatutDocument";
import { MascotteAnalyse } from "@/components/tarineo/MascotteAnalyse";
import { MascotteDashboard } from "@/components/tarineo/MascotteDashboard";
import { Badge } from "@/components/ui/badge";
import { logoFournisseur } from "@/lib/logosFournisseurs";
import { Button } from "@/components/ui/button";
import { Card, CardAction, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty";
import { GraphiqueDepensesMensuelles } from "./AccueilCharts";
import { GraphiqueEconomiesSemaineMotion } from "./GraphiqueEconomiesSemaineMotion";
import { AppMotionCard } from "@/components/tarineo/motion/AppMotionCard";
import { AppStagger, AppStaggerItem } from "@/components/tarineo/motion/AppStagger";
import { ImportDocument } from "../documents/ImportDocument";
import { CarteResume } from "@/components/tarineo/CarteResume";
import { DashboardCartesZero } from "@/components/tarineo/DashboardCartesZero";
import { QuotaStrip } from "@/components/tarineo/QuotaStrip";
import type { EtatQuota } from "@/lib/quota";

const formaterEuros = (valeur: number) =>
  new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(valeur);

const MOIS_COURTS_FR = ["janv.", "févr.", "mars", "avr.", "mai", "juin", "juil.", "août", "sept.", "oct.", "nov.", "déc."];

const formaterDateFigma = (date: Date | null) => {
  if (!date) return "—";
  const day = String(date.getUTCDate()).padStart(2, "0");
  const month = MOIS_COURTS_FR[date.getUTCMonth()];
  return `${day} ${month}, ${date.getUTCFullYear()}`;
};

const descriptionFournisseur = (nom: string, norm: string) => {
  const key = norm.toLowerCase();
  if (key.includes("cedeo")) return "Détection automatique des hausses sur vos devis Cedeo.";
  if (key.includes("point")) return "Comparaison des prix multi-agences Point P.";
  if (key.includes("rexel")) return "Suivi des tarifs matériel électrique Rexel.";
  return `Suivi des dépenses et hausses chez ${nom}.`;
};

const scoreObjectif = (f: FournisseurCarte) => {
  if (f.pourcentageAtteinte === null) return null;
  return Math.min(100, Math.round(f.pourcentageAtteinte));
};

function LogoFournisseur({
  nom,
  norm,
  logoUrl,
  size = 28,
  rounded = "md",
}: {
  nom: string;
  norm?: string;
  logoUrl?: string | null;
  size?: number;
  rounded?: "md" | "full";
}) {
  const src = logoUrl ?? logoFournisseur(norm ?? nom);
  const radius = rounded === "full" ? "rounded-full" : "rounded-[4px]";
  if (src) {
    return (
      <Image
        src={src}
        alt=""
        width={size}
        height={size}
        className={`shrink-0 object-contain ${radius}`}
        style={{ width: size, height: size }}
      />
    );
  }
  return (
    <div
      className={`flex shrink-0 items-center justify-center overflow-hidden bg-secondary font-bold text-primary ${radius}`}
      style={{ width: size, height: size, fontSize: size > 36 ? 16 : 11 }}
    >
      {nom.charAt(0).toUpperCase()}
    </div>
  );
}

export type FournisseurCarte = {
  distributor: string;
  distributorNorm: string;
  logoUrl: string | null;
  depenses: number;
  pourcentageAtteinte: number | null;
  objectif: number | null;
};

export type DocumentRecent = {
  id: string;
  distributor: string;
  distributorNorm: string | null;
  logoUrl: string | null;
  documentDate: Date | null;
  totalHt: number | null;
  hausseLabel: string;
  haussePositive: boolean;
  hausseNegative: boolean;
};

export function DashboardHeroImport({
  compteVide,
  enAttenteDeDonnees = false,
  etatQuota,
  documentsEnCours = 0,
}: {
  compteVide: boolean;
  enAttenteDeDonnees?: boolean;
  etatQuota?: EtatQuota | null;
  documentsEnCours?: number;
}) {
  if (!compteVide && !enAttenteDeDonnees) return null;

  const titre = enAttenteDeDonnees ? "Indicateurs en cours de calcul" : "Démarrez votre historique";
  const sousTitre = enAttenteDeDonnees
    ? "Validez des factures ou bons de commande pour alimenter le tableau de bord."
    : "Importez vos premiers documents — Tarinéo construit fournisseurs et alertes automatiquement.";

  return (
    <section className="w-full min-w-0 rounded-[20px] border border-border bg-card p-4 sm:p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <h2 className="text-lg font-semibold text-foreground">{titre}</h2>
          <p className="mt-1 text-sm text-muted-foreground">{sousTitre}</p>
        </div>
        {etatQuota && <QuotaStrip etat={etatQuota} />}
      </div>

      <div className="mt-4">
        <DashboardCartesZero
          documents={enAttenteDeDonnees ? documentsEnCours : 0}
          documentsHint={enAttenteDeDonnees && documentsEnCours > 0 ? "En analyse" : undefined}
        />
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <ImportDocument label="Importer un document" className="h-auto rounded-full px-5 py-2.5 text-sm" />
        {enAttenteDeDonnees && (
          <Button
            variant="outline"
            render={<Link prefetch={false} href="/documents" />}
            className="h-auto rounded-full px-5 py-2.5 text-sm"
          >
            Voir mes documents
          </Button>
        )}
      </div>
    </section>
  );
}

export function DashboardBanniereReprise({ etatQuota }: { etatQuota?: EtatQuota | null }) {
  return (
    <section className="w-full min-w-0 rounded-[20px] border border-primary/25 bg-[#FFF8F5] p-4 sm:p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <h2 className="text-base font-semibold text-foreground">Import en attente</h2>
          <p className="mt-1 text-sm text-muted-foreground">Vous aviez reporté — il suffit d&apos;un import pour démarrer.</p>
        </div>
        {etatQuota && <QuotaStrip etat={etatQuota} />}
      </div>
      <div className="mt-4">
        <DashboardCartesZero />
      </div>
      <div className="mt-4">
        <ImportDocument label="Importer mes documents" className="h-auto rounded-full px-5 py-2.5 text-sm" />
      </div>
    </section>
  );
}

export function DashboardAnalyseEnCours({ documentsEnCours }: { documentsEnCours: number }) {
  if (documentsEnCours <= 0) return null;

  return (
    <section className="w-full min-w-0 rounded-[20px] border border-[#FFE4D6] bg-[#FFF8F5] p-4 sm:p-5">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <CarteResume label="En analyse" valeur={String(documentsEnCours)} hint="Extraction IA en cours" />
          <p className="text-sm text-muted-foreground">Le tableau de bord se met à jour à la fin du traitement.</p>
        </div>
        <MascotteAnalyse size="sm" className="shrink-0" />
      </div>
    </section>
  );
}

export function DashboardAFaire({
  aVerifier,
  hausses,
  moisCourantStr,
}: {
  aVerifier: number;
  hausses: number;
  moisCourantStr: string;
}) {
  if (aVerifier === 0 && hausses === 0) return null;

  return (
    <section className="w-full min-w-0 rounded-[24px] border border-[#E8EAED] bg-card p-5 sm:p-6">
      <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:gap-8">
        <div className="min-w-0 flex-1">
          <h2 className="text-base font-semibold text-foreground">À vérifier</h2>

          <ul className="mt-3 flex flex-col gap-2">
            {aVerifier > 0 && (
              <li className="flex items-center gap-3 rounded-2xl bg-secondary px-4 py-3.5 sm:gap-4">
                <span
                  className="flex size-11 shrink-0 items-center justify-center rounded-full bg-primary/10 text-lg font-semibold tabular-nums text-primary"
                  aria-hidden
                >
                  {aVerifier}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-foreground">À vérifier</p>
                </div>
                <Button size="sm" render={<Link href="/documents" />} className="shrink-0 rounded-full">
                  Vérifier
                </Button>
              </li>
            )}
            {hausses > 0 && (
              <li className="flex items-center gap-3 rounded-2xl bg-[#FFF0E8] px-4 py-3.5 sm:gap-4">
                <span
                  className="flex size-11 shrink-0 items-center justify-center rounded-full bg-primary/15 text-lg font-semibold tabular-nums text-primary"
                  aria-hidden
                >
                  {hausses}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-foreground">Hausses détectées</p>
                </div>
                <Button
                  size="sm"
                  render={<Link href={`/documents?hausse=1&mois=${moisCourantStr}`} />}
                  className="shrink-0 rounded-full"
                >
                  Voir
                </Button>
              </li>
            )}
          </ul>
        </div>

        <MascotteAnalyse size="sm" className="mx-auto shrink-0 sm:mx-0" />
      </div>
    </section>
  );
}

export function DashboardSupplierRow({ fournisseurs }: { fournisseurs: FournisseurCarte[] }) {
  return (
    <section className="w-full min-w-0">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3 sm:mb-8">
        <h2 className="text-xl font-medium leading-none text-foreground sm:text-2xl">Vos fournisseurs suivis</h2>
        <Button variant="ghost" size="sm" render={<Link href="/fournisseurs" />} className="text-muted-foreground">
          Voir tout
          <ArrowUpRightIcon data-icon="inline-end" />
        </Button>
      </div>
      {fournisseurs.length === 0 ? (
        <Card className="rounded-[24px] ring-0">
          <CardContent>
            <Empty className="py-8">
              <EmptyHeader>
                <EmptyMedia>
                  <MascotteDashboard variant="clinOeilPointe" />
                </EmptyMedia>
                <EmptyTitle>Aucun fournisseur suivi</EmptyTitle>
                <EmptyDescription>
                  Importez un devis ou une facture pour voir vos enseignes ici, avec le volume de la période.
                </EmptyDescription>
              </EmptyHeader>
              <EmptyContent>
                <ImportDocument label="Importer un document" />
              </EmptyContent>
            </Empty>
          </CardContent>
        </Card>
      ) : (
        <AppStagger className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3 xl:gap-6">
          {fournisseurs.map((f) => {
            const score = scoreObjectif(f);
            return (
              <AppStaggerItem key={f.distributorNorm}>
              <AppMotionCard>
              <Card className="h-full rounded-[24px] ring-0">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <LogoFournisseur nom={f.distributor} norm={f.distributorNorm} logoUrl={f.logoUrl} />
                    <span className="truncate text-base font-medium">{f.distributor}</span>
                  </CardTitle>
                  {score !== null && (
                    <CardAction>
                      <Badge variant="secondary" className="gap-1 text-[var(--app-star)]" title="Avancement de l'objectif annuel">
                        <StarIcon data-icon="inline-start" />
                        {score}%
                      </Badge>
                    </CardAction>
                  )}
                  <CardDescription>{descriptionFournisseur(f.distributor, f.distributorNorm)}</CardDescription>
                </CardHeader>
                <CardFooter className="justify-between border-t bg-transparent">
                  <p className="text-xl font-medium text-[var(--app-text-body)]">{formaterEuros(f.depenses)}</p>
                  <Button
                    variant="outline"
                    size="sm"
                    render={<Link href={`/fournisseurs/${encodeURIComponent(f.distributorNorm)}`} />}
                    className="rounded-full text-primary"
                  >
                    Voir
                    <ArrowUpRightIcon data-icon="inline-end" />
                  </Button>
                </CardFooter>
              </Card>
              </AppMotionCard>
              </AppStaggerItem>
            );
          })}
        </AppStagger>
      )}
    </section>
  );
}

export function DashboardRecentDocuments({ documents }: { documents: DocumentRecent[] }) {
  return (
    <Card className="min-h-0 w-full rounded-[24px] ring-0 lg:min-h-[538px]">
      <CardHeader>
        <CardTitle className="text-xl">Documents récents</CardTitle>
        <CardDescription>Importés cette semaine</CardDescription>
        <CardAction>
          <Button variant="ghost" size="sm" render={<Link href="/documents" />} className="text-muted-foreground">
            Voir tout
          </Button>
        </CardAction>
      </CardHeader>
      <CardContent className="flex flex-1 flex-col">
        {documents.length === 0 ? (
          <Empty className="flex-1 py-10">
            <EmptyHeader>
              <EmptyMedia>
                <MascotteDashboard variant="regardeGauche" />
              </EmptyMedia>
              <EmptyTitle>Aucun document cette semaine</EmptyTitle>
              <EmptyDescription>Vos derniers devis et factures apparaîtront ici dès le premier import.</EmptyDescription>
            </EmptyHeader>
            <EmptyContent>
              <ImportDocument label="Envoyer un document" />
            </EmptyContent>
          </Empty>
        ) : (
          <ul className="flex flex-1 flex-col">
            {documents.map((doc) => (
              <li key={doc.id}>
                <Link
                  href={`/documents/${doc.id}`}
                  className="flex items-center justify-between gap-3 rounded-xl px-3 py-2 transition-colors hover:bg-secondary"
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <LogoFournisseur
                      nom={doc.distributor}
                      norm={doc.distributorNorm ?? undefined}
                      logoUrl={doc.logoUrl}
                      size={48}
                      rounded="full"
                    />
                    <div className="min-w-0">
                      <p className="truncate text-base font-medium text-foreground">{doc.distributor}</p>
                      <p className="text-[13px] text-muted-foreground">{formaterDateFigma(doc.documentDate)}</p>
                    </div>
                  </div>
                  <div className="shrink-0 text-right">
                    <p className="text-base font-medium text-foreground">
                      {doc.totalHt !== null ? formaterEuros(Number(doc.totalHt)) : "—"}
                    </p>
                    <BadgeHaussePrix
                      label={doc.hausseLabel}
                      haussePositive={doc.haussePositive}
                      hausseNegative={doc.hausseNegative}
                      className="mt-0.5"
                    />
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}

export function DashboardWeeklySavings({
  totalSemaine,
  evolutionPct,
  donneesSemaine,
}: {
  totalSemaine: number;
  evolutionPct: number | null;
  donneesSemaine: { jour: string; montant: number }[];
}) {
  const semaineVide = totalSemaine === 0 && donneesSemaine.every((d) => d.montant === 0);

  return (
    <Card className="w-full min-w-0 rounded-[24px] ring-0">
      <CardHeader>
        <CardTitle className="text-base font-medium text-muted-foreground">Économies détectées cette semaine</CardTitle>
        <CardAction>
          <Badge variant="outline" className="rounded-full px-4 py-2 text-primary">
            Euros
          </Badge>
        </CardAction>
      </CardHeader>
      <CardContent className="flex flex-col gap-6">
        {semaineVide ? (
          <Empty className="border-0 py-6">
            <EmptyHeader>
              <EmptyMedia>
                <MascotteDashboard variant="loupe" />
              </EmptyMedia>
              <EmptyTitle>Pas encore d&apos;économie repérée</EmptyTitle>
              <EmptyDescription>
                Dès qu&apos;une hausse est détectée et qu&apos;un prix plus bas existe dans votre historique, le
                montant apparaît ici.
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        ) : (
          <>
            <div className="flex flex-wrap items-start gap-1.5">
              <p className="text-[32px] font-medium leading-none text-foreground">{formaterEuros(totalSemaine)}</p>
              {evolutionPct !== null && (
                <Badge className="bg-[var(--app-green)] text-white">
                  {evolutionPct >= 0 ? "+" : ""}
                  {evolutionPct.toFixed(0)}%
                </Badge>
              )}
            </div>
            <div className="overflow-x-auto">
              <GraphiqueEconomiesSemaineMotion donnees={donneesSemaine} />
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}

export function DashboardOverviewStats({
  nbDocumentsMois,
  hausseMoyenne,
  economiesPotentielles,
  moisCourantStr,
  payloadsCount,
}: {
  nbDocumentsMois: number;
  hausseMoyenne: number | null;
  economiesPotentielles: number;
  moisCourantStr: string;
  payloadsCount: number;
}) {
  const stats = [
    {
      label: "Documents ce mois",
      sub: "Ce mois-ci",
      value: String(nbDocumentsMois),
      suffix: "documents",
      href: `/documents?mois=${moisCourantStr}`,
      cliquable: nbDocumentsMois > 0,
      icon: "/dashboard/icon-stat-documents.png",
    },
    {
      label: "Hausse moyenne détectée",
      sub: "Ce mois-ci",
      value: hausseMoyenne !== null ? hausseMoyenne.toFixed(1).replace(".", ",") : "—",
      suffix: hausseMoyenne !== null ? "%" : "",
      href: `/documents?hausse=1&mois=${moisCourantStr}#documents-envoyes`,
      cliquable: payloadsCount > 0,
      icon: "/dashboard/icon-stat-hausse.png",
    },
    {
      label: "Économies potentielles",
      sub: "Ce mois-ci",
      value: new Intl.NumberFormat("fr-FR", { maximumFractionDigits: 0 }).format(economiesPotentielles),
      suffix: "€",
      href: `/documents?hausse=1&mois=${moisCourantStr}#documents-envoyes`,
      cliquable: payloadsCount > 0,
      icon: "/dashboard/icon-stat-economies.png",
    },
  ];

  return (
    <Card className="w-full min-w-0 rounded-[24px] ring-0">
      <CardHeader>
        <CardTitle className="text-xl">Vue d&apos;ensemble</CardTitle>
        <CardAction>
          <Button variant="ghost" size="sm" render={<Link href="/documents" />} className="text-muted-foreground">
            Voir tout
          </Button>
        </CardAction>
      </CardHeader>
      <CardContent>
        <div className="grid gap-3 sm:grid-cols-3">
          {stats.map((s) => {
            const inner = (
              <div className="flex h-full min-h-[116px] flex-col justify-between rounded-[20px] bg-secondary p-4">
                <div className="flex items-start gap-2">
                  <Image
                    src={s.icon}
                    alt=""
                    width={31}
                    height={31}
                    className="size-[31px] shrink-0"
                    aria-hidden
                  />
                  <div className="min-w-0 pt-0.5">
                    <p className="text-[11.5px] font-semibold leading-tight text-foreground">{s.label}</p>
                    <p className="mt-1 text-[10px] text-muted-foreground">{s.sub}</p>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-base font-semibold text-primary">{s.value}</span>
                  {s.suffix && <span className="text-sm text-muted-foreground">{s.suffix}</span>}
                </div>
              </div>
            );
            return s.cliquable ? (
              <Link key={s.label} href={s.href} className="block transition-opacity hover:opacity-90">
                {inner}
              </Link>
            ) : (
              <div key={s.label}>{inner}</div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

export function DashboardDepensesChart({
  donnees,
  aDesDepenses,
}: {
  donnees: { mois: string; montant: number }[];
  aDesDepenses: boolean;
}) {
  return (
    <Card className="w-full min-w-0 rounded-[24px] ring-0">
      <CardHeader>
        <CardTitle className="text-xl">Dépenses des 6 derniers mois</CardTitle>
      </CardHeader>
      <CardContent>
        {aDesDepenses ? (
          <GraphiqueDepensesMensuelles donnees={donnees} />
        ) : (
          <Empty>
            <EmptyHeader>
              <EmptyMedia>
                <MascotteDashboard variant="panneauTerrain" />
              </EmptyMedia>
              <EmptyTitle>Pas encore de courbe</EmptyTitle>
              <EmptyDescription>Validez des factures ou bons de commande pour tracer vos dépenses.</EmptyDescription>
            </EmptyHeader>
          </Empty>
        )}
      </CardContent>
    </Card>
  );
}
