"use client";

import { useState } from "react";

export interface PointHistoriquePrix {
  date: string;
  prix: number;
  distributor: string;
  distributorNorm: string;
}

const PALETTE_COURBES = ["#F97316", "#38BDF8", "#A78BFA", "#FB923C", "#F472B6"];

const formaterEuros = (valeur: number) =>
  new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR" }).format(valeur);

const formaterDateCourte = (iso: string) =>
  new Date(iso).toLocaleDateString("fr-FR", { day: "2-digit", month: "short", year: "2-digit" });

const formaterMoisAnnee = (iso: string) =>
  new Date(iso).toLocaleDateString("fr-FR", { month: "short", year: "numeric" });

const formaterMoisAnneeCourt = (iso: string) =>
  new Date(iso).toLocaleDateString("fr-FR", { month: "short", year: "2-digit" });

export function MiniSparklinePrix({ points }: { points: PointHistoriquePrix[] }) {
  if (points.length < 2) return null;

  const pointsTries = [...points].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  const prix = pointsTries.map((p) => p.prix);
  const min = Math.min(...prix);
  const max = Math.max(...prix);
  const etendue = max - min || 1;
  const w = 88;
  const h = 28;
  const coords = pointsTries.map((p, i) => {
    const x = (i / (pointsTries.length - 1)) * w;
    const y = h - ((p.prix - min) / etendue) * (h - 4) - 2;
    return `${x},${y}`;
  });

  const dernier = pointsTries[pointsTries.length - 1];
  const premier = pointsTries[0];
  const tendance = dernier.prix > premier.prix ? "#EF4444" : dernier.prix < premier.prix ? "#22C55E" : "#F97316";

  return (
    <svg
      viewBox={`0 0 ${w} ${h}`}
      className="h-7 w-[88px]"
      role="img"
      aria-label="Mini-graphique d'évolution du prix"
    >
      <polyline
        points={coords.join(" ")}
        fill="none"
        stroke={tendance}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function GraphiqueHistoriquePrix({
  points,
  defautOuvert = false,
}: {
  points: PointHistoriquePrix[];
  defautOuvert?: boolean;
}) {
  const [ouvert, setOuvert] = useState(defautOuvert);

  if (points.length === 0) return null;

  const pointsTries = [...points].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  return (
    <div className="mt-3 border-t border-border/60 pt-3">
      <button
        type="button"
        onClick={() => setOuvert((o) => !o)}
        aria-expanded={ouvert}
        className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground transition-colors hover:text-accent"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
          width={12}
          height={12}
          className={`h-3 w-3 shrink-0 transition-transform ${ouvert ? "rotate-90" : ""}`}
          aria-hidden="true"
        >
          <path d="M9 6l6 6-6 6" />
        </svg>
        {ouvert ? "Masquer l'historique des prix" : "Voir l'historique des prix"}
      </button>

      {ouvert && (
        <div className="mt-3 space-y-3">
          <GraphiqueBarres points={pointsTries} />
          <ListeAchats points={pointsTries} />
        </div>
      )}
    </div>
  );
}

function couleurDistributeur(
  distributorNorm: string,
  indexParDistributeur: Map<string, number>,
): string {
  const index = indexParDistributeur.get(distributorNorm) ?? 0;
  return PALETTE_COURBES[index % PALETTE_COURBES.length];
}

function GraphiqueBarres({ points }: { points: PointHistoriquePrix[] }) {
  const distributeursUniques = [...new Set(points.map((p) => p.distributorNorm))];
  const indexParDistributeur = new Map(distributeursUniques.map((d, i) => [d, i]));
  const multiDistributeurs = distributeursUniques.length > 1;

  const prix = points.map((p) => p.prix);
  const min = Math.min(...prix);
  const max = Math.max(...prix);
  const marge = (max - min) * 0.15 || Math.max(max * 0.1, 1);
  const yMin = Math.max(0, min - marge);
  const yMax = max + marge;
  const etendueY = yMax - yMin || 1;

  const LARGEUR = 340;
  const HAUTEUR = 148;
  const PAD_LEFT = 46;
  const PAD_RIGHT = 10;
  const PAD_TOP = 10;
  const PAD_BOTTOM = 34;

  const zoneW = LARGEUR - PAD_LEFT - PAD_RIGHT;
  const zoneH = HAUTEUR - PAD_TOP - PAD_BOTTOM;
  const n = points.length;
  const gap = n > 1 ? Math.min(10, zoneW / (n * 4)) : 0;
  const barW = Math.min(52, (zoneW - gap * (n - 1)) / n);

  const posY = (v: number) => PAD_TOP + zoneH - ((v - yMin) / etendueY) * zoneH;
  const baseY = PAD_TOP + zoneH;

  const graduationsY = [yMin, yMin + etendueY / 2, yMax];

  return (
    <div className="rounded-lg bg-background px-2 py-2">
      <p className="mb-2 px-1 text-[0.65rem] font-medium uppercase tracking-wide text-muted-foreground">
        Évolution des prix d&apos;achat
      </p>
      <svg
        viewBox={`0 0 ${LARGEUR} ${HAUTEUR}`}
        className="w-full overflow-visible"
        role="img"
        aria-label="Diagramme des prix d'achat par mois"
      >
        {graduationsY.map((v, i) => (
          <g key={i}>
            <line
              x1={PAD_LEFT}
              y1={posY(v)}
              x2={LARGEUR - PAD_RIGHT}
              y2={posY(v)}
              className="stroke-border/70"
              strokeWidth={1}
              strokeDasharray={i === 1 ? "3 3" : undefined}
            />
            <text
              x={PAD_LEFT - 6}
              y={posY(v) + 3}
              textAnchor="end"
              className="fill-muted-foreground text-[8px]"
            >
              {formaterEuros(v).replace(/\s/g, "\u202f")}
            </text>
          </g>
        ))}

        <line
          x1={PAD_LEFT}
          y1={baseY}
          x2={LARGEUR - PAD_RIGHT}
          y2={baseY}
          className="stroke-border"
          strokeWidth={1}
        />

        {points.map((p, i) => {
          const x = PAD_LEFT + i * (barW + gap) + (zoneW - n * barW - gap * (n - 1)) / 2;
          const y = posY(p.prix);
          const h = baseY - y;
          const couleur = couleurDistributeur(p.distributorNorm, indexParDistributeur);
          const labelX = x + barW / 2;

          return (
            <g key={`${p.date}-${p.distributorNorm}-${p.prix}`}>
              <rect
                x={x}
                y={y}
                width={barW}
                height={Math.max(h, 2)}
                rx={3}
                fill={couleur}
                opacity={0.9}
              >
                <title>{`${p.distributor} · ${formaterEuros(p.prix)} · ${formaterDateCourte(p.date)}`}</title>
              </rect>
              <text
                x={labelX}
                y={baseY + 12}
                textAnchor="middle"
                className="fill-muted-foreground text-[8px]"
              >
                {formaterMoisAnneeCourt(p.date)}
              </text>
              {n <= 6 && (
                <text
                  x={labelX}
                  y={baseY + 22}
                  textAnchor="middle"
                  className="fill-muted-foreground text-[7px]"
                >
                  {new Date(p.date).toLocaleDateString("fr-FR", { day: "2-digit", month: "2-digit" })}
                </text>
              )}
              <text
                x={labelX}
                y={Math.max(PAD_TOP + 8, y - 4)}
                textAnchor="middle"
                className="fill-foreground text-[8px] font-semibold"
              >
                {formaterEuros(p.prix).replace(/\s/g, "\u202f")}
              </text>
            </g>
          );
        })}
      </svg>

      {multiDistributeurs && (
        <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 px-1">
          {distributeursUniques.map((norm, i) => {
            const nom = points.find((p) => p.distributorNorm === norm)?.distributor ?? norm;
            return (
              <span key={norm} className="flex items-center gap-1.5 text-[0.65rem] text-muted-foreground">
                <span
                  className="h-2 w-2 shrink-0 rounded-sm"
                  style={{ backgroundColor: PALETTE_COURBES[i % PALETTE_COURBES.length] }}
                  aria-hidden="true"
                />
                {nom}
              </span>
            );
          })}
        </div>
      )}

      {points.length === 1 && (
        <p className="mt-2 px-1 text-[0.65rem] text-muted-foreground">
          Premier achat enregistré — le diagramme se complétera à chaque nouvelle facture ou bon de commande.
        </p>
      )}
    </div>
  );
}

function ListeAchats({ points }: { points: PointHistoriquePrix[] }) {
  const pointsRecents = [...points].reverse();

  return (
    <div className="rounded-lg border border-border/60 bg-background px-3 py-2.5">
      <p className="mb-2 text-[0.65rem] font-medium uppercase tracking-wide text-muted-foreground">
        Achats par date
      </p>
      <ul className="space-y-1.5">
        {pointsRecents.map((p) => (
          <li
            key={`${p.date}-${p.distributorNorm}-${p.prix}`}
            className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-0.5 text-xs"
          >
            <span className="text-muted-foreground">
              <span className="font-medium text-foreground">{formaterMoisAnnee(p.date)}</span>
              <span className="mx-1.5 text-border">·</span>
              {new Date(p.date).toLocaleDateString("fr-FR", {
                day: "2-digit",
                month: "long",
                year: "numeric",
              })}
              <span className="mx-1.5 text-border">·</span>
              {p.distributor}
            </span>
            <span className="shrink-0 font-semibold tabular-nums text-foreground">{formaterEuros(p.prix)}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
