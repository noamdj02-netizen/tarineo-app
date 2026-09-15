"use client";

import { useState } from "react";

export interface PointHistoriquePrix {
  date: string;
  prix: number;
  distributor: string;
  distributorNorm: string;
}

// Orange en premier (distributeur le plus récent, généralement celui du document
// courant), puis quelques teintes secondaires bien distinctes du rouge/vert déjà
// utilisés pour les hausses/baisses ailleurs dans la carte.
const PALETTE_COURBES = ["#F97316", "#38BDF8", "#A78BFA", "#FB923C", "#F472B6"];

const formaterEuros = (valeur: number) =>
  new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR" }).format(valeur);

const formaterDateCourte = (iso: string) =>
  new Date(iso).toLocaleDateString("fr-FR", { day: "2-digit", month: "short", year: "2-digit" });

const formaterMoisAnnee = (iso: string) =>
  new Date(iso).toLocaleDateString("fr-FR", { month: "short", year: "numeric" });

// Repliée par défaut sous les infos de prix de chaque carte produit (voir page.tsx) :
// un clic dévoile la courbe d'évolution, construite à partir des mêmes PriceHistory
// que "Moy. 12 mois" et l'alerte de hausse, mais tous distributeurs confondus.
export function GraphiqueHistoriquePrix({ points }: { points: PointHistoriquePrix[] }) {
  const [ouvert, setOuvert] = useState(false);

  if (points.length === 0) return null;

  return (
    <div className="mt-3 border-t border-border/60 pt-3">
      <button
        type="button"
        onClick={() => setOuvert((o) => !o)}
        aria-expanded={ouvert}
        className="flex items-center gap-1.5 text-xs font-medium text-muted transition-colors hover:text-accent"
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

      {ouvert &&
        (points.length === 1 ? (
          <div className="mt-3 flex items-start gap-2.5 rounded-lg bg-background px-3 py-2.5 text-xs text-muted">
            <span
              className="mt-1 h-2 w-2 shrink-0 rounded-full"
              style={{ backgroundColor: PALETTE_COURBES[0] }}
              aria-hidden="true"
            />
            <span>
              Un seul achat enregistré pour l&apos;instant : {formaterEuros(points[0].prix)} le{" "}
              {formaterDateCourte(points[0].date)}. L&apos;historique se construira au fil de vos prochains devis.
            </span>
          </div>
        ) : (
          <GraphiqueLignes points={points} />
        ))}
    </div>
  );
}

function GraphiqueLignes({ points }: { points: PointHistoriquePrix[] }) {
  const groupes = new Map<string, PointHistoriquePrix[]>();
  for (const p of points) {
    const liste = groupes.get(p.distributorNorm) ?? [];
    liste.push(p);
    groupes.set(p.distributorNorm, liste);
  }
  // Le distributeur dont l'achat le plus récent est le plus proche d'aujourd'hui passe
  // en premier (couleur accent) — c'est le plus pertinent pour l'artisan qui consulte
  // ce document.
  const groupesTries = [...groupes.values()]
    .map((groupe) => [...groupe].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()))
    .sort((a, b) => new Date(b[b.length - 1].date).getTime() - new Date(a[a.length - 1].date).getTime());
  const multiDistributeurs = groupesTries.length > 1;

  const prix = points.map((p) => p.prix);
  const min = Math.min(...prix);
  const max = Math.max(...prix);
  const marge = (max - min) * 0.2 || Math.max(max * 0.1, 1);
  const yMin = Math.max(0, min - marge);
  const yMax = max + marge;

  const dates = points.map((p) => new Date(p.date).getTime());
  const xMin = Math.min(...dates);
  const xMax = Math.max(...dates);
  const etendueX = xMax - xMin || 1;
  const etendueY = yMax - yMin || 1;

  const LARGEUR = 320;
  const HAUTEUR = 108;
  const PAD_X = 6;
  const PAD_TOP = 16;
  const PAD_BOTTOM = 8;

  const posX = (t: number) => PAD_X + ((t - xMin) / etendueX) * (LARGEUR - PAD_X * 2);
  const posY = (v: number) => HAUTEUR - PAD_BOTTOM - ((v - yMin) / etendueY) * (HAUTEUR - PAD_TOP - PAD_BOTTOM);

  const dernierPoint = points[points.length - 1];

  return (
    <div className="mt-3">
      <svg
        viewBox={`0 0 ${LARGEUR} ${HAUTEUR}`}
        className="w-full overflow-visible"
        role="img"
        aria-label="Évolution du prix de ce produit dans le temps"
      >
        <line
          x1={PAD_X}
          y1={HAUTEUR - PAD_BOTTOM}
          x2={LARGEUR - PAD_X}
          y2={HAUTEUR - PAD_BOTTOM}
          className="stroke-border"
          strokeWidth={1}
        />
        {groupesTries.map((groupe, i) => {
          const couleur = PALETTE_COURBES[i % PALETTE_COURBES.length];
          const chemin = groupe.map((p) => `${posX(new Date(p.date).getTime())},${posY(p.prix)}`).join(" ");
          return (
            <g key={groupe[0].distributorNorm}>
              {groupe.length > 1 && (
                <polyline
                  points={chemin}
                  fill="none"
                  stroke={couleur}
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              )}
              {groupe.map((p) => (
                <circle key={p.date + p.prix} cx={posX(new Date(p.date).getTime())} cy={posY(p.prix)} r={3} fill={couleur}>
                  <title>{`${p.distributor} · ${formaterEuros(p.prix)} · ${formaterDateCourte(p.date)}`}</title>
                </circle>
              ))}
            </g>
          );
        })}
        <text
          x={posX(new Date(dernierPoint.date).getTime())}
          y={Math.max(9, posY(dernierPoint.prix) - 8)}
          textAnchor="end"
          className="fill-foreground text-[9px] font-semibold"
        >
          {formaterEuros(dernierPoint.prix)}
        </text>
      </svg>
      <div className="mt-1 flex items-center justify-between text-[0.65rem] text-muted">
        <span>{formaterMoisAnnee(points[0].date)}</span>
        <span>{formaterMoisAnnee(dernierPoint.date)}</span>
      </div>
      {multiDistributeurs && (
        <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1">
          {groupesTries.map((groupe, i) => (
            <span key={groupe[0].distributorNorm} className="flex items-center gap-1.5 text-[0.65rem] text-muted">
              <span
                className="h-2 w-2 shrink-0 rounded-full"
                style={{ backgroundColor: PALETTE_COURBES[i % PALETTE_COURBES.length] }}
                aria-hidden="true"
              />
              {groupe[0].distributor}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
