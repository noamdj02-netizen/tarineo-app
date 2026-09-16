import Image from "next/image";
import Link from "next/link";
import { ArrowUpRightIcon, FileTextIcon, StarIcon, UploadIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { logoFournisseur } from "@/lib/logosFournisseurs";
import { Button } from "@/components/ui/button";
import { Card, CardAction, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty";
import { GraphiqueEconomiesSemaine, GraphiqueDepensesMensuelles } from "./AccueilCharts";

const formaterEuros = (valeur: number) =>
  new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(valeur);

const MOIS_COURTS_EN = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

const formaterDateFigma = (date: Date | null) => {
  if (!date) return "—";
  const day = String(date.getUTCDate()).padStart(2, "0");
  const month = MOIS_COURTS_EN[date.getUTCMonth()];
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

function IconeStat() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth={1.75} className="size-[18px]" aria-hidden="true">
      <path d="M3 14V8M9 14V3M15 14v-5" strokeLinecap="round" />
    </svg>
  );
}

function LogoFournisseur({ nom, norm, size = 28, rounded = "md" }: { nom: string; norm?: string; size?: number; rounded?: "md" | "full" }) {
  const src = logoFournisseur(norm ?? nom);
  const radius = rounded === "full" ? "rounded-full" : "rounded-[4px]";
  if (src) {
    return (
      <Image
        src={src}
        alt=""
        width={size}
        height={size}
        className={`shrink-0 object-cover ${radius}`}
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
  depenses: number;
  pourcentageAtteinte: number | null;
  objectif: number | null;
};

export type DocumentRecent = {
  id: string;
  distributor: string;
  documentDate: Date | null;
  totalHt: number | null;
  hausseLabel: string;
  haussePositive: boolean;
  hausseNegative: boolean;
};

export function DashboardHeroImport({ compteVide }: { compteVide: boolean }) {
  if (!compteVide) return null;
  return (
    <section className="w-full min-w-0 rounded-[24px] bg-gradient-to-br from-[#FFF0E8] via-card to-[#F3F7FA] p-6 sm:p-8">
      <p className="text-sm font-medium uppercase tracking-wider text-primary">Pour commencer</p>
      <h2 className="mt-2 max-w-xl text-2xl font-semibold leading-tight text-foreground sm:text-3xl">
        Importez un devis fournisseur pour protéger votre marge
      </h2>
      <p className="mt-3 max-w-lg text-sm leading-relaxed text-muted-foreground">
        Photo ou PDF d&apos;un devis Cedeo, Point P, Rexel… Tarineo extrait les prix et les compare à
        <strong className="font-medium text-foreground"> vos</strong> achats précédents — pas à un comparateur public.
      </p>
      <div className="mt-6 flex flex-wrap gap-3">
        <Button render={<Link href="/documents" />} className="h-auto rounded-full px-6 py-3">
          <UploadIcon data-icon="inline-start" />
          Importer un devis
        </Button>
        <Button variant="outline" render={<Link href="/fournisseurs" />} className="h-auto rounded-full px-6 py-3">
          Voir les fournisseurs
        </Button>
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
                <EmptyMedia variant="icon">
                  <UploadIcon />
                </EmptyMedia>
                <EmptyTitle>Aucun fournisseur suivi</EmptyTitle>
                <EmptyDescription>
                  Importez un devis ou une facture pour voir vos enseignes ici, avec le volume de la période.
                </EmptyDescription>
              </EmptyHeader>
              <EmptyContent>
                <Button render={<Link href="/documents" />}>Importer un document</Button>
              </EmptyContent>
            </Empty>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3 xl:gap-6">
          {fournisseurs.map((f) => {
            const score = scoreObjectif(f);
            return (
              <Card key={f.distributorNorm} className="h-full rounded-[24px] ring-0">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <LogoFournisseur nom={f.distributor} norm={f.distributorNorm} />
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
            );
          })}
        </div>
      )}
    </section>
  );
}

export function DashboardRecentDocuments({ documents }: { documents: DocumentRecent[] }) {
  return (
    <Card className="min-h-0 w-full rounded-[24px] ring-0 lg:min-h-[538px]">
      <CardHeader>
        <CardTitle className="text-xl">Devis récents</CardTitle>
        <CardDescription>Scans de la semaine</CardDescription>
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
              <EmptyMedia variant="icon">
                <FileTextIcon />
              </EmptyMedia>
              <EmptyTitle>Aucun document cette semaine</EmptyTitle>
              <EmptyDescription>Vos derniers devis et factures apparaîtront ici dès le premier import.</EmptyDescription>
            </EmptyHeader>
            <EmptyContent>
              <Button render={<Link href="/documents" />}>Envoyer un document</Button>
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
                    <LogoFournisseur nom={doc.distributor} size={48} rounded="full" />
                    <div className="min-w-0">
                      <p className="truncate text-base font-medium text-foreground">{doc.distributor}</p>
                      <p className="text-[13px] text-muted-foreground">{formaterDateFigma(doc.documentDate)}</p>
                    </div>
                  </div>
                  <div className="shrink-0 text-right">
                    <p className="text-base font-medium text-foreground">
                      {doc.totalHt !== null ? formaterEuros(Number(doc.totalHt)) : "—"}
                    </p>
                    <Badge variant={doc.haussePositive ? "destructive" : "secondary"} className="mt-0.5">
                      {doc.hausseLabel}
                    </Badge>
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
          <GraphiqueEconomiesSemaine donnees={donneesSemaine} />
        </div>
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
      label: "Devis scannés",
      sub: "Ce mois-ci",
      value: String(nbDocumentsMois),
      suffix: "documents",
      href: `/documents?mois=${moisCourantStr}`,
      cliquable: nbDocumentsMois > 0,
    },
    {
      label: "Hausse moyenne détectée",
      sub: "Ce mois-ci",
      value: hausseMoyenne !== null ? hausseMoyenne.toFixed(1).replace(".", ",") : "—",
      suffix: hausseMoyenne !== null ? "%" : "",
      href: `/documents?hausse=1&mois=${moisCourantStr}#documents-envoyes`,
      cliquable: payloadsCount > 0,
    },
    {
      label: "Économies potentielles",
      sub: "Ce mois-ci",
      value: new Intl.NumberFormat("fr-FR", { maximumFractionDigits: 0 }).format(economiesPotentielles),
      suffix: "€",
      href: `/documents?hausse=1&mois=${moisCourantStr}#documents-envoyes`,
      cliquable: payloadsCount > 0,
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
                  <div className="flex size-[31px] shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground">
                    <IconeStat />
                  </div>
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
              <EmptyTitle>Pas encore de courbe</EmptyTitle>
              <EmptyDescription>Validez des factures ou bons de commande pour tracer vos dépenses.</EmptyDescription>
            </EmptyHeader>
          </Empty>
        )}
      </CardContent>
    </Card>
  );
}
