"use client";

import {
  AlertTriangleIcon,
  CheckCircle2Icon,
  CircleDashedIcon,
  SparklesIcon,
  TrendingDownIcon,
  TrendingUpIcon,
} from "lucide-react";
import { MascotteAnalyse } from "@/components/tarineo/MascotteAnalyse";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardAction, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress, ProgressLabel } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { useAnalyseDocument } from "./AnalyseDocumentContext";
import type { FiltreLigne } from "@/lib/analyseDocument";
import { cn } from "@/lib/utils";

const formaterEuros = (valeur: number) =>
  new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR" }).format(valeur);

type Repartition = {
  alertes: number;
  baisses: number;
  stables: number;
  nouvelles: number;
};

type VerificationTotaux = {
  totalLignes: number;
  totalDocument: number | null;
  ecart: number | null;
  coherent: boolean | null;
};

type Props = {
  confiance: number | null;
  nombreLignes: number;
  avecHistorique: number;
  refsFabricant: number;
  repartition: Repartition;
  impactTotal: number;
  distributeur: string | null;
  champsExtraits: { label: string; ok: boolean }[];
  resumePhrase: string;
  verificationTotaux: VerificationTotaux;
  economiesCount: number;
};

const FILTRES: { id: FiltreLigne; label: string; visible: (p: Props) => boolean }[] = [
  { id: "toutes", label: "Toutes", visible: () => true },
  { id: "hausses", label: "Hausses", visible: (p) => p.repartition.alertes > 0 },
  { id: "nouvelles", label: "Nouvelles", visible: (p) => p.repartition.nouvelles > 0 },
  { id: "baisses", label: "Baisses", visible: (p) => p.repartition.baisses > 0 },
  { id: "economies", label: "Économies ailleurs", visible: (p) => p.economiesCount > 0 },
];

type SegmentRepartition = {
  key: keyof Repartition;
  label: string;
  valeur: number;
  className: string;
};

function StatAnalyse({
  label,
  valeur,
  hint,
  className,
}: {
  label: string;
  valeur: string | number;
  hint?: string;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-col gap-3 rounded-2xl bg-secondary p-4", className)}>
      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className="text-2xl font-semibold tabular-nums text-foreground">{valeur}</p>
      {hint ? <p className="text-xs text-muted-foreground">{hint}</p> : null}
    </div>
  );
}

function BarreRepartition({ repartition, total }: { repartition: Repartition; total: number }) {
  const segments = (
    [
      { key: "alertes" as const, label: "Hausses", valeur: repartition.alertes, className: "bg-destructive" },
      { key: "baisses" as const, label: "Baisses", valeur: repartition.baisses, className: "bg-[var(--app-green)]" },
      { key: "stables" as const, label: "Stables", valeur: repartition.stables, className: "bg-[var(--app-chart-fill)]" },
      { key: "nouvelles" as const, label: "Nouvelles", valeur: repartition.nouvelles, className: "bg-primary" },
    ] satisfies SegmentRepartition[]
  ).filter((s) => s.valeur > 0);

  if (total === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        Aucune comparaison disponible — ce document alimentera votre historique pour les prochaines analyses.
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex h-3 overflow-hidden rounded-full bg-[var(--app-chart-track)]">
        {segments.map((s) => (
          <div
            key={s.key}
            className={cn("h-full transition-all", s.className)}
            style={{ width: `${(s.valeur / total) * 100}%` }}
            title={`${s.label} : ${s.valeur}`}
          />
        ))}
      </div>
      <ul className="flex flex-col gap-2">
        {segments.map((s) => (
          <li key={s.key} className="flex items-center justify-between gap-3 text-sm">
            <span className="flex items-center gap-2 text-muted-foreground">
              <span className={cn("size-2.5 shrink-0 rounded-full", s.className)} aria-hidden="true" />
              {s.label}
            </span>
            <span className="font-semibold tabular-nums text-foreground">{s.valeur}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function allerAuxLignes() {
  document.getElementById("lignes-analyse")?.scrollIntoView({ behavior: "smooth", block: "start" });
}

export function BandeauAnalyseIA(props: Props) {
  const {
    confiance,
    nombreLignes,
    avecHistorique,
    refsFabricant,
    repartition,
    impactTotal,
    distributeur,
    champsExtraits,
    resumePhrase,
    verificationTotaux,
  } = props;
  const { filtre, setFiltre } = useAnalyseDocument();
  const pctConfiance = confiance !== null ? Math.round(confiance * 100) : null;
  const totalRepartition =
    repartition.alertes + repartition.baisses + repartition.stables + repartition.nouvelles;
  const champsOk = champsExtraits.filter((c) => c.ok).length;
  const filtresVisibles = FILTRES.filter((f) => f.visible(props));

  return (
    <Card className="rounded-[24px] ring-0">
      <CardHeader className="border-b">
        <CardTitle className="flex items-center gap-2 text-xl">
          <SparklesIcon data-icon="inline-start" />
          Analyse IA du document
        </CardTitle>
        <CardDescription>
          {nombreLignes} ligne{nombreLignes > 1 ? "s" : ""} produit lue{nombreLignes > 1 ? "s" : ""}
          {distributeur ? ` chez ${distributeur}` : ""}, comparée{nombreLignes > 1 ? "s" : ""} à votre historique
          d&apos;achats.
        </CardDescription>
        <CardAction>
          <MascotteAnalyse size="sm" />
        </CardAction>
      </CardHeader>

      <CardContent className="flex flex-col gap-6">
        <div className="flex flex-col gap-3 rounded-2xl border border-border bg-card p-4">
          <p className="text-sm font-medium leading-relaxed text-foreground">{resumePhrase}</p>
          {filtresVisibles.length > 1 && (
            <div className="flex flex-wrap gap-2">
              {filtresVisibles.map((f) => (
                <Button
                  key={f.id}
                  type="button"
                  size="sm"
                  variant={filtre === f.id ? "default" : "outline"}
                  onClick={() => {
                    setFiltre(f.id);
                    allerAuxLignes();
                  }}
                >
                  {f.label}
                  {f.id === "hausses" && repartition.alertes > 0 ? ` (${repartition.alertes})` : ""}
                  {f.id === "nouvelles" && repartition.nouvelles > 0 ? ` (${repartition.nouvelles})` : ""}
                  {f.id === "baisses" && repartition.baisses > 0 ? ` (${repartition.baisses})` : ""}
                  {f.id === "economies" && props.economiesCount > 0 ? ` (${props.economiesCount})` : ""}
                </Button>
              ))}
            </div>
          )}
        </div>

        {verificationTotaux.coherent !== null && (
          <div
            className={cn(
              "rounded-2xl border px-4 py-3 text-sm",
              verificationTotaux.coherent
                ? "border-emerald-200 bg-emerald-50 text-emerald-900"
                : "border-amber-200 bg-amber-50 text-amber-900",
            )}
          >
            {verificationTotaux.coherent ? (
              <p>
                Total des lignes ({formaterEuros(verificationTotaux.totalLignes)}) cohérent avec le total document (
                {formaterEuros(verificationTotaux.totalDocument ?? 0)}).
              </p>
            ) : (
              <p>
                Écart de {formaterEuros(Math.abs(verificationTotaux.ecart ?? 0))} entre la somme des lignes (
                {formaterEuros(verificationTotaux.totalLignes)}) et le total document (
                {formaterEuros(verificationTotaux.totalDocument ?? 0)}).
              </p>
            )}
          </div>
        )}

        {pctConfiance !== null && (
          <div className="flex flex-col gap-4 rounded-2xl bg-secondary p-4 sm:flex-row sm:items-center">
            <div className="flex min-w-0 flex-1 flex-col gap-2">
              <Progress value={pctConfiance} className="w-full">
                <div className="flex w-full items-center justify-between gap-3">
                  <ProgressLabel>Confiance sur l&apos;extraction</ProgressLabel>
                  <span className="text-sm font-semibold tabular-nums text-foreground">{pctConfiance}%</span>
                </div>
              </Progress>
              <p className="text-xs text-muted-foreground">
                {pctConfiance >= 90
                  ? "Extraction fiable — peu de vérification manuelle attendue."
                  : pctConfiance >= 70
                    ? "Extraction correcte — vérifiez les totaux si besoin."
                    : "Confiance faible — relisez les lignes avant validation."}
              </p>
            </div>
            <Badge variant={pctConfiance >= 90 ? "default" : pctConfiance >= 70 ? "secondary" : "destructive"}>
              {pctConfiance >= 90 ? "Fiable" : pctConfiance >= 70 ? "À vérifier" : "Faible"}
            </Badge>
          </div>
        )}

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatAnalyse label="Lignes extraites" valeur={nombreLignes} hint="Produits détectés dans le document" />
          <StatAnalyse
            label="Avec historique"
            valeur={avecHistorique}
            hint="Lignes déjà achetées chez ce distributeur"
          />
          <StatAnalyse label="Réf. fabricant" valeur={refsFabricant} hint="Codes pour le comparateur inter-enseignes" />
          <StatAnalyse
            label="Impact hausses"
            valeur={impactTotal > 0 ? formaterEuros(impactTotal) : "—"}
            hint={impactTotal > 0 ? "Surcoût estimé vs vos derniers achats" : "Aucune hausse détectée"}
            className={impactTotal > 0 ? "bg-destructive/5" : undefined}
          />
        </div>

        <div className="grid gap-4 lg:grid-cols-[1fr_auto] lg:items-start">
          <div className="flex flex-col gap-3 rounded-2xl border border-border bg-card p-4">
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm font-medium text-foreground">Comparaison à votre historique</p>
              <Badge variant="outline">{totalRepartition} ligne{totalRepartition > 1 ? "s" : ""}</Badge>
            </div>
            <BarreRepartition repartition={repartition} total={totalRepartition} />
          </div>

          <ul className="flex flex-col gap-2 lg:min-w-[220px]">
            {repartition.alertes > 0 && (
              <li className="flex items-center gap-3 rounded-2xl bg-destructive/5 px-4 py-3">
                <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-destructive/10 text-destructive">
                  <TrendingUpIcon />
                </span>
                <div>
                  <p className="text-sm font-medium text-foreground">{repartition.alertes} hausse{repartition.alertes > 1 ? "s" : ""}</p>
                  <p className="text-xs text-muted-foreground">+ de 3 % vs dernier achat</p>
                </div>
              </li>
            )}
            {repartition.baisses > 0 && (
              <li className="flex items-center gap-3 rounded-2xl bg-secondary px-4 py-3">
                <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-[var(--app-green)]/15 text-[var(--app-green)]">
                  <TrendingDownIcon />
                </span>
                <div>
                  <p className="text-sm font-medium text-foreground">{repartition.baisses} baisse{repartition.baisses > 1 ? "s" : ""}</p>
                  <p className="text-xs text-muted-foreground">Prix en dessous de votre habitude</p>
                </div>
              </li>
            )}
            {repartition.nouvelles > 0 && (
              <li className="flex items-center gap-3 rounded-2xl bg-primary/5 px-4 py-3">
                <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <AlertTriangleIcon />
                </span>
                <div>
                  <p className="text-sm font-medium text-foreground">{repartition.nouvelles} nouvelle{repartition.nouvelles > 1 ? "s" : ""}</p>
                  <p className="text-xs text-muted-foreground">Premier achat enregistré chez ce fournisseur</p>
                </div>
              </li>
            )}
          </ul>
        </div>
      </CardContent>

      <Separator />

      <CardFooter className="flex-col items-start gap-3 border-t-0 bg-transparent">
        <div className="flex w-full flex-wrap items-center justify-between gap-2">
          <p className="text-sm font-medium text-foreground">Champs détectés par l&apos;IA</p>
          <Badge variant="secondary">
            {champsOk}/{champsExtraits.length} validés
          </Badge>
        </div>
        <ul className="flex flex-wrap gap-2">
          {champsExtraits.map((champ) => (
            <li key={champ.label}>
              <Badge variant={champ.ok ? "secondary" : "outline"} className="gap-1.5">
                {champ.ok ? <CheckCircle2Icon data-icon="inline-start" /> : <CircleDashedIcon data-icon="inline-start" />}
                {champ.label}
              </Badge>
            </li>
          ))}
        </ul>
      </CardFooter>
    </Card>
  );
}
