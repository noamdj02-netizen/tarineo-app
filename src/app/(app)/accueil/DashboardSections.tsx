import Link from "next/link";
import { ArrowUpRightIcon, FileTextIcon, StarIcon, UploadIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { BrandMark } from "@/components/tarineo/BrandMark";
import { logoFournisseur } from "@/lib/logosFournisseurs";
import { trouverFournisseurConnu } from "@/lib/fournisseursConnus";
import { Button } from "@/components/ui/button";
import { Card, CardAction, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty";
import { GraphiqueEconomiesSemaine } from "./AccueilCharts";
import { GraphiqueDepensesInteractif } from "./GraphiqueDepensesInteractif";

const formaterEuros = (valeur: number) =>
  new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(valeur);

const formaterDateFigma = (date: Date | null) => {
  if (!date) return "—";
  return date.toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric" });
};

const descriptionFournisseur = (nom: string, norm: string) => {
  const connu = trouverFournisseurConnu(nom) ?? trouverFournisseurConnu(norm);
  if (connu) {
    return connu.groupe ? `${connu.specialite} · groupe ${connu.groupe}` : connu.specialite;
  }
  return `Suivi des dépenses et hausses chez ${nom}.`;
};

const labelFournisseur = (f: FournisseurCarte) => {
  if (f.pourcentageAtteinte !== null) return `${Math.min(100, Math.round(f.pourcentageAtteinte))}% BFA`;
  return null;
};

function explicationDocument(doc: DocumentRecent): string | null {
  if (doc.haussePositive) {
    return `Un ou plusieurs prix sont plus élevés que votre dernier achat chez ${doc.distributor}. Ouvrez le document pour voir le détail ligne par ligne.`;
  }
  if (doc.hausseNegative) {
    return `Bonne nouvelle : certains prix sont en baisse par rapport à votre historique chez ${doc.distributor}.`;
  }
  if (doc.hausseLabel === "Stable") {
    return `Prix alignés avec votre historique récent chez ${doc.distributor}.`;
  }
  return null;
}

function IconeStat() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth={1.75} className="size-[18px]" aria-hidden="true">
      <path d="M3 14V8M9 14V3M15 14v-5" strokeLinecap="round" />
    </svg>
  );
}

// Délègue à BrandMark pour ne pas dupliquer le repli quand logo.dev ne répond pas.
function LogoFournisseur({ nom, norm, size = 28, rounded = "md" }: { nom: string; norm?: string; size?: number; rounded?: "md" | "full" }) {
  return <BrandMark nom={nom} logo={logoFournisseur(norm ?? nom)} size={size} rounded={rounded} />;
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

export function DashboardSupplierRow({
  fournisseurs,
  utiliseDemo = false,
}: {
  fournisseurs: FournisseurCarte[];
  utiliseDemo?: boolean;
}) {
  return (
    <section className="w-full min-w-0">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3 sm:mb-8">
        <h2 className="text-xl font-medium leading-none text-foreground sm:text-2xl">Vos fournisseurs suivis ce mois-ci</h2>
        <Button variant="ghost" size="sm" render={<Link href="/fournisseurs" />} className="text-muted-foreground">
          Bibliothèque
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
                <EmptyDescription>Envoyez un devis ou une facture pour voir vos enseignes ici, avec le volume du mois.</EmptyDescription>
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
            const badge = labelFournisseur(f);
            const href = utiliseDemo
              ? "/documents?onboarding=1"
              : `/fournisseurs/${encodeURIComponent(f.distributorNorm)}`;
            return (
              <Link key={f.distributorNorm} href={href} className="block h-full">
                <Card className="h-full rounded-[24px] ring-0 transition-shadow hover:shadow-md">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-base font-medium">
                      <LogoFournisseur nom={f.distributor} norm={f.distributorNorm} />
                      <span className="truncate">{f.distributor}</span>
                    </CardTitle>
                    {badge && (
                      <CardAction>
                        <Badge variant="secondary" className="gap-1 text-[var(--app-star)]">
                          <StarIcon data-icon="inline-start" />
                          {badge}
                        </Badge>
                      </CardAction>
                    )}
                    <CardDescription>{descriptionFournisseur(f.distributor, f.distributorNorm)}</CardDescription>
                  </CardHeader>
                  <CardFooter className="justify-between border-t bg-transparent">
                    <p className="text-xl font-medium text-[var(--app-text-body)]">{formaterEuros(f.depenses)}</p>
                    <span className="inline-flex items-center gap-1 text-sm font-medium text-primary">
                      {utiliseDemo ? "Importer" : "Fiche fournisseur"}
                      <ArrowUpRightIcon className="size-4" />
                    </span>
                  </CardFooter>
                </Card>
              </Link>
            );
          })}
        </div>
      )}
    </section>
  );
}

export function DashboardRecentDocuments({
  documents,
  utiliseDemo = false,
}: {
  documents: DocumentRecent[];
  utiliseDemo?: boolean;
}) {
  return (
    <Card className="min-h-0 w-full rounded-[24px] ring-0 lg:min-h-[538px]">
      <CardHeader>
        <CardTitle className="text-xl">Documents récents</CardTitle>
        <CardDescription>Imports de la semaine</CardDescription>
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
            {documents.map((doc) => {
              const detail = explicationDocument(doc);
              return (
                <li key={doc.id}>
                  <Link
                    href={utiliseDemo || doc.id.startsWith("demo-") ? "/documents?onboarding=1" : `/documents/${doc.id}`}
                    className="block rounded-xl px-3 py-2 transition-colors hover:bg-secondary"
                  >
                    <div className="flex items-center justify-between gap-3">
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
                    </div>
                    {detail && !utiliseDemo && (
                      <p className="mt-2 pl-[60px] text-xs leading-relaxed text-muted-foreground">{detail}</p>
                    )}
                  </Link>
                </li>
              );
            })}
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
  utiliseDemo = false,
}: {
  nbDocumentsMois: number;
  hausseMoyenne: number | null;
  economiesPotentielles: number;
  moisCourantStr: string;
  payloadsCount: number;
  utiliseDemo?: boolean;
}) {
  const stats = [
    {
      label: "Devis scannés",
      sub: "Ce mois-ci",
      value: String(nbDocumentsMois),
      suffix: "documents",
      href: `/documents?mois=${moisCourantStr}`,
      cliquable: !utiliseDemo && nbDocumentsMois > 0,
    },
    {
      label: "Hausse moyenne détectée",
      sub: "Ce mois-ci",
      value: hausseMoyenne !== null ? hausseMoyenne.toFixed(1).replace(".", ",") : "—",
      suffix: hausseMoyenne !== null ? "%" : "",
      href: utiliseDemo ? "/documents?onboarding=1" : `/documents?hausse=1&mois=${moisCourantStr}#documents-envoyes`,
      cliquable: !utiliseDemo && payloadsCount > 0,
    },
    {
      label: "Économies potentielles",
      sub: "Ce mois-ci",
      value: new Intl.NumberFormat("fr-FR", { maximumFractionDigits: 0 }).format(economiesPotentielles),
      suffix: "€",
      href: utiliseDemo ? "/documents?onboarding=1" : `/documents?hausse=1&mois=${moisCourantStr}#documents-envoyes`,
      cliquable: !utiliseDemo && payloadsCount > 0,
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
  utiliseDemo = false,
}: {
  donnees: { mois: string; montant: number }[];
  aDesDepenses: boolean;
  utiliseDemo?: boolean;
}) {
  return (
    <Card className="w-full min-w-0 rounded-[24px] ring-0">
      <CardHeader>
        <CardTitle className="text-xl">Dépenses des 6 derniers mois</CardTitle>
      </CardHeader>
      <CardContent>
        {aDesDepenses ? (
          <GraphiqueDepensesInteractif donnees={donnees} liensActifs={!utiliseDemo} />
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
