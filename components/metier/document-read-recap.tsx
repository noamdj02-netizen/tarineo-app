"use client";

import { AlertTriangle, CheckCircle2, HelpCircle } from "lucide-react";
import type { DocumentRecap, ReliabilityLevel } from "@/lib/metier/document-agent/types";
import { cn } from "@/lib/utils";

const RELIABILITY_COPY: Record<
  ReliabilityLevel,
  { label: string; hint: string; tone: "ok" | "warn" | "bad" }
> = {
  fiable: {
    label: "Lecture fiable",
    hint: "Les champs principaux concordent — relisez quand même avant d’enregistrer.",
    tone: "ok",
  },
  a_verifier: {
    label: "À vérifier",
    hint: "Relisez les lignes signalées avant d’enregistrer le document.",
    tone: "warn",
  },
  peu_fiable: {
    label: "Lecture incertaine",
    hint: "Fichier flou ou structure inhabituelle — corrigez ou importez une meilleure copie.",
    tone: "bad",
  },
};

export function DocumentReadRecap({
  recap,
  vendorName,
  profileVersion,
}: {
  recap: DocumentRecap;
  vendorName?: string;
  profileVersion?: number;
}) {
  const rel = RELIABILITY_COPY[recap.reliability];
  const toneBorder =
    rel.tone === "ok"
      ? "border-brand-orange/30 bg-wash-orange/50"
      : rel.tone === "warn"
        ? "border-amber-600/35 bg-amber-500/8"
        : "border-destructive/40 bg-destructive/5";

  return (
    <section className={cn("flex flex-col gap-4 rounded-card border p-4 sm:p-5", toneBorder)} aria-live="polite">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="text-[12px] font-semibold tracking-[0.06em] text-[#FF6B1A] uppercase">Récapitulatif agent</p>
          <h2 className="mt-1 font-display text-[18px] font-semibold tracking-tight text-ink">{rel.label}</h2>
          <p className="mt-1 text-[13px] text-muted-foreground">{rel.hint}</p>
        </div>
        <div className="shrink-0 text-right">
          <p className="font-display text-[28px] font-semibold tabular-nums leading-none text-ink">{recap.score}</p>
          <p className="text-[11px] text-muted-foreground">/ 100</p>
        </div>
      </div>

      <p className="text-[14px] leading-relaxed text-ink">{recap.summary}</p>

      {vendorName ? (
        <p className="text-[12.5px] text-muted-foreground">
          Enseigne : <span className="font-medium text-ink">{vendorName}</span>
          {profileVersion ? ` · profil communautaire v${profileVersion}` : null}
        </p>
      ) : null}

      <ul className="flex flex-col gap-2">
        {recap.checks.map((c) => (
          <li key={c.id} className="flex items-start gap-2 text-[13px]">
            {c.ok ? (
              <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-brand-orange" aria-hidden />
            ) : (
              <HelpCircle className="mt-0.5 size-4 shrink-0 text-amber-700 dark:text-amber-500" aria-hidden />
            )}
            <span>
              <span className="font-medium text-ink">{c.label}</span>
              {c.detail ? <span className="text-muted-foreground"> — {c.detail}</span> : null}
            </span>
          </li>
        ))}
      </ul>

      {recap.caveats.length ? (
        <div className="rounded-xl border border-line/80 bg-surface px-3 py-2.5">
          <p className="flex items-center gap-1.5 text-[12px] font-semibold text-ink">
            <AlertTriangle className="size-3.5 text-amber-600" aria-hidden />
            Points d’attention
          </p>
          <ul className="mt-1.5 list-disc pl-5 text-[12.5px] text-muted-foreground">
            {recap.caveats.map((c) => (
              <li key={c}>{c}</li>
            ))}
          </ul>
        </div>
      ) : null}
    </section>
  );
}
