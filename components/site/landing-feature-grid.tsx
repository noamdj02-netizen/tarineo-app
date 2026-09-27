import { FileSpreadsheet, Mic } from "lucide-react";
import { Reveal } from "@/components/motion/reveal";
import { PriceMove } from "@/components/site/delta-badge";
import { InView } from "@/components/site/in-view";
import { SupplierLogo } from "@/components/site/supplier-logo";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ALERT_THRESHOLD,
  FEATURES,
  FEATURES_SOON,
  HERO_SAMPLE,
  euro,
  euroDelta,
  euroInt,
  type FeatureId,
} from "@/lib/site/tarineo";
import { cn } from "@/lib/utils";

/** Fonctionnalités réellement livrées dans l'app, chacune avec un mini-écran fidèle à l'app. */
export function LandingFeatureGrid() {
  return (
    <div className="mx-auto flex max-w-[1080px] flex-col gap-5">
      <InView className="grid gap-4 md:grid-cols-2 lg:grid-cols-3" stagger={0.06}>
        {FEATURES.map((f) => (
          <Reveal key={f.id} className="h-full">
            <Card className="card-lift group/feature h-full gap-0 rounded-2xl py-0 shadow-soft">
              <div className="relative h-[200px] overflow-hidden border-b border-border bg-surface-2 p-3.5">
                <FeatureVisual id={f.id} />
              </div>
              <CardHeader className="gap-2 px-5 pt-5">
                <p className="font-mono text-[11px] font-medium tracking-[0.14em] text-brand-orange uppercase">
                  {f.kicker}
                </p>
                <CardTitle className="text-[1.1875rem] leading-snug font-semibold">{f.title}</CardTitle>
              </CardHeader>
              <CardContent className="px-5 pt-2 pb-6">
                <CardDescription className="text-[15px] leading-relaxed sm:text-base">{f.text}</CardDescription>
              </CardContent>
            </Card>
          </Reveal>
        ))}
      </InView>

      <InView
        className="flex flex-wrap items-center justify-center gap-2 text-[15px] text-muted-foreground sm:text-base"
        stagger={0.05}
        delay={0.1}
      >
        <Reveal>
          <span>Bientôt :</span>
        </Reveal>
        {FEATURES_SOON.map((s) => (
          <Reveal key={s}>
            <Badge
              variant="outline"
              className="h-7 rounded-md px-2.5 text-[12.5px] font-medium"
            >
              {s}
            </Badge>
          </Reveal>
        ))}
      </InView>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Mini-écrans (données d'exemple)                                     */
/* ------------------------------------------------------------------ */

function FeatureVisual({ id }: { id: FeatureId }) {
  switch (id) {
    case "alertes":
      return <AlertVisual />;
    case "classement":
      return <FilingVisual />;
    case "depenses":
      return <SpendVisual />;
    case "comparateur":
      return <CompareVisual />;
    case "devis":
      return <QuoteVisual />;
    case "export":
      return <ExportVisual />;
  }
}

function AlertVisual() {
  return (
    <div
      className="flex h-full flex-col justify-between rounded-xl bg-alert-wash px-3.5 py-3 ring-1 ring-brand-orange/35"
      aria-hidden
    >
      <div className="flex items-center gap-2.5">
        <SupplierLogo name="Cedeo" size={28} />
        <div className="min-w-0">
          <p className="truncate text-[14px] font-semibold">{HERO_SAMPLE.product}</p>
          <p className="text-[12px] text-white/50">{HERO_SAMPLE.supplier} · devis du 12 sept.</p>
        </div>
      </div>
      <PriceMove before={HERO_SAMPLE.before} after={HERO_SAMPLE.after} align="start" />
      <p className="font-display text-[13px] font-semibold text-brand-orange-light">
        Alerte à +{ALERT_THRESHOLD} % : {euroDelta(HERO_SAMPLE.after - HERO_SAMPLE.before)} sur cette ligne
      </p>
    </div>
  );
}

function FilingVisual() {
  const docs = [
    { supplier: "Rexel", kind: "Facture", month: "Sept.", total: 1285 },
    { supplier: "Cedeo", kind: "Bon de commande", month: "Sept.", total: 612 },
    { supplier: "Point.P", kind: "Facture", month: "Août", total: 948 },
  ];
  return (
    <ul
      className="flex h-full flex-col overflow-hidden rounded-xl bg-surface ring-1 ring-border"
      aria-hidden
    >
      {docs.map((d, i) => (
        <li
          key={d.supplier + d.kind}
          className={cn(
            "flex flex-1 items-center gap-2.5 px-3",
            i < docs.length - 1 && "border-b border-white/8",
          )}
        >
          <SupplierLogo name={d.supplier} size={26} />
          <div className="min-w-0 flex-1">
            <p className="truncate text-[13px] font-semibold">{d.kind}</p>
            <p className="text-[12px] text-white/45">
              {d.supplier} · {d.month}
            </p>
          </div>
          <span className="font-display text-[15px] font-semibold tabular-nums">
            {euroInt(d.total)}
          </span>
        </li>
      ))}
    </ul>
  );
}

function SpendVisual() {
  const rows = [
    { supplier: "Cedeo", amount: 23400 },
    { supplier: "Rexel", amount: 17880 },
    { supplier: "Point.P", amount: 15120 },
  ];
  return (
    <ul
      className="flex h-full flex-col overflow-hidden rounded-xl bg-surface ring-1 ring-border"
      aria-hidden
    >
      {rows.map((r, i) => (
        <li
          key={r.supplier}
          className={cn(
            "flex flex-1 items-center gap-2.5 px-3",
            i < rows.length - 1 && "border-b border-white/8",
            i === 0 && "bg-alert-wash",
          )}
        >
          <SupplierLogo name={r.supplier} size={26} />
          <span className="flex-1 text-[14px] font-semibold">{r.supplier}</span>
          <span className="font-display text-[16px] font-semibold tabular-nums">
            {euroInt(r.amount)}
          </span>
        </li>
      ))}
    </ul>
  );
}

function CompareVisual() {
  return (
    <div
      className="flex h-full flex-col justify-between rounded-xl bg-surface p-3 ring-1 ring-border"
      aria-hidden
    >
      <p className="text-[12px] text-white/50">Vanne d’arrêt 3/4</p>
      <div className="grid grid-cols-2 gap-2">
        <div className="rounded-lg bg-surface-2 px-2.5 py-2.5">
          <p className="flex items-center gap-1.5 text-[12px] text-white/55">
            <SupplierLogo name="Cedeo" size={18} /> Ce devis
          </p>
          <p className="mt-1 font-display text-[18px] font-semibold tabular-nums">
            {euro(19.95)}
          </p>
        </div>
        <div className="rounded-lg bg-gain/10 px-2.5 py-2.5 ring-1 ring-gain/25">
          <p className="flex items-center gap-1.5 text-[12px] text-gain">
            <SupplierLogo name="Rexel" size={18} /> Rexel
          </p>
          <p className="mt-1 font-display text-[18px] font-semibold text-gain tabular-nums">
            {euro(17.8)}
          </p>
        </div>
      </div>
      <p className="text-[13px] font-medium text-gain">
        Moins cher de {euro(2.15)}
      </p>
    </div>
  );
}

function QuoteVisual() {
  const lines = [
    ["Matériel Cedeo", 850],
    ["Main-d’œuvre, 8 h", 400],
    ["Déplacement", 60],
  ] as const;
  return (
    <div className="relative h-full" aria-hidden>
      <div className="flex h-full flex-col rounded-xl bg-paper px-3.5 py-3 text-paper-ink ring-1 ring-black/10">
        <div className="flex items-center justify-between border-b border-black/10 pb-2">
          <span className="text-[12px] font-semibold">Devis 2026-014</span>
          <span className="rounded bg-paper-ink px-1.5 py-0.5 text-[9px] font-semibold text-white">
            LOGO
          </span>
        </div>
        <ul className="mt-2 flex flex-col gap-1.5 text-[12.5px]">
          {lines.map(([l, v]) => (
            <li key={l} className="flex justify-between gap-2">
              <span className="truncate text-black/60">{l}</span>
              <span className="font-display font-semibold tabular-nums">
                {euroInt(v)}
              </span>
            </li>
          ))}
        </ul>
        <div className="mt-auto flex justify-between border-t border-black/10 pt-2">
          <span className="text-[12px] text-black/50">Total HT</span>
          <span className="font-display text-[18px] font-semibold tabular-nums">
            {euroInt(1310)}
          </span>
        </div>
      </div>
      <span className="absolute right-2 bottom-2 inline-flex items-center gap-1 rounded-md bg-brand-orange px-2 py-1 text-[11px] font-semibold text-white">
        <Mic className="size-3" /> Voix
      </span>
    </div>
  );
}

function ExportVisual() {
  return (
    <div
      className="flex h-full flex-col justify-between rounded-xl bg-surface p-3.5 ring-1 ring-border"
      aria-hidden
    >
      <p className="text-[12px] text-white/50">
        Prix de vente · Tube PER 16×20
      </p>
      <div>
        <p className="text-[13px] text-white/55">{euro(14.2)} + 25 %</p>
        <p className="font-display text-[28px] leading-none font-semibold text-brand-orange-light tabular-nums">
          {euro(17.75)}
        </p>
      </div>
      <p className="flex items-center gap-2 text-[13px] text-white/70">
        <FileSpreadsheet className="size-4 text-white/50" />
        depenses-2026.xlsx
      </p>
    </div>
  );
}
