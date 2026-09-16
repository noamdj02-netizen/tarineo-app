"use client";

import Link from "next/link";
import { useState } from "react";
import { cn } from "@/lib/utils";

const formaterMoisCourt = (cle: string) => {
  const [annee, mois] = cle.split("-").map(Number);
  return new Date(Date.UTC(annee, mois - 1, 1)).toLocaleDateString("fr-FR", { month: "short" });
};

const formaterMoisLong = (cle: string) => {
  const [annee, mois] = cle.split("-").map(Number);
  return new Date(Date.UTC(annee, mois - 1, 1)).toLocaleDateString("fr-FR", { month: "long", year: "numeric" });
};

const formaterEuros = (valeur: number) =>
  new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(valeur);

export function GraphiqueDepensesInteractif({
  donnees,
  liensActifs = true,
}: {
  donnees: { mois: string; montant: number }[];
  liensActifs?: boolean;
}) {
  const [survole, setSurvole] = useState<number | null>(null);
  const max = Math.max(...donnees.map((d) => d.montant), 1);
  const LARGEUR = 320;
  const HAUTEUR = 160;
  const PAD_TOP = 14;
  const PAD_BOTTOM = 24;
  const GAP = 10;
  const largeurBarre = (LARGEUR - GAP * (donnees.length - 1)) / donnees.length;
  const indexActif = survole ?? donnees.length - 1;
  const pointActif = donnees[indexActif];

  return (
    <div>
      <div
        className="mb-3 flex min-h-[2rem] items-baseline justify-between gap-2 rounded-xl bg-secondary/60 px-3 py-2 transition-all duration-200"
        aria-live="polite"
      >
        <span className="text-sm font-medium capitalize text-foreground">
          {pointActif ? formaterMoisLong(pointActif.mois) : "—"}
        </span>
        <span className="text-lg font-semibold text-primary">
          {pointActif ? formaterEuros(pointActif.montant) : "—"}
        </span>
      </div>

      <svg
        viewBox={`0 0 ${LARGEUR} ${HAUTEUR}`}
        className="mt-2 w-full overflow-visible"
        role="img"
        aria-label="Évolution des dépenses sur les 6 derniers mois"
      >
        {donnees.map((d, i) => {
          const hauteurBarre = Math.max(4, ((HAUTEUR - PAD_TOP - PAD_BOTTOM) * d.montant) / max);
          const x = i * (largeurBarre + GAP);
          const y = HAUTEUR - PAD_BOTTOM - hauteurBarre;
          const actif = i === indexActif;
          const contenu = (
            <>
              <rect
                x={x}
                y={PAD_TOP}
                width={largeurBarre}
                height={HAUTEUR - PAD_TOP - PAD_BOTTOM}
                rx={6}
                className="fill-[var(--app-chart-track)]"
              />
              <rect
                x={x}
                y={y}
                width={largeurBarre}
                height={hauteurBarre}
                rx={6}
                className={cn(
                  "transition-all duration-200 ease-out",
                  actif ? "fill-[var(--accent)]" : "fill-[var(--app-chart-fill)]"
                )}
                style={{ transform: actif ? "scaleY(1.02)" : undefined, transformOrigin: `${x + largeurBarre / 2}px ${HAUTEUR - PAD_BOTTOM}px` }}
              />
              <text
                x={x + largeurBarre / 2}
                y={HAUTEUR - 6}
                textAnchor="middle"
                className={cn("text-[10px] transition-colors", actif ? "fill-foreground font-semibold" : "fill-muted")}
              >
                {formaterMoisCourt(d.mois)}
              </text>
            </>
          );

          if (!liensActifs) {
            return (
              <g
                key={d.mois}
                onMouseEnter={() => setSurvole(i)}
                onMouseLeave={() => setSurvole(null)}
                onFocus={() => setSurvole(i)}
                onBlur={() => setSurvole(null)}
                tabIndex={0}
                className="cursor-pointer outline-none"
              >
                {contenu}
              </g>
            );
          }

          return (
            <Link
              key={d.mois}
              href={`/documents?mois=${d.mois}#documents-envoyes`}
              className="group outline-none"
              onMouseEnter={() => setSurvole(i)}
              onMouseLeave={() => setSurvole(null)}
              onFocus={() => setSurvole(i)}
              onBlur={() => setSurvole(null)}
            >
              {contenu}
            </Link>
          );
        })}
      </svg>
      {liensActifs && (
        <p className="mt-2 text-center text-xs text-muted-foreground">Touchez une barre pour voir les documents du mois</p>
      )}
    </div>
  );
}
