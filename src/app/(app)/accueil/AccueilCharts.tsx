import Link from "next/link";

const formaterMoisCourt = (cle: string) => {
  const [annee, mois] = cle.split("-").map(Number);
  return new Date(Date.UTC(annee, mois - 1, 1)).toLocaleDateString("fr-FR", { month: "short" });
};

const formaterMoisLong = (cle: string) => {
  const [annee, mois] = cle.split("-").map(Number);
  return new Date(Date.UTC(annee, mois - 1, 1)).toLocaleDateString("fr-FR", { month: "long" });
};

export function GraphiqueDepensesMensuelles({ donnees }: { donnees: { mois: string; montant: number }[] }) {
  const max = Math.max(...donnees.map((d) => d.montant), 1);
  const LARGEUR = 320;
  const HAUTEUR = 160;
  const PAD_TOP = 14;
  const PAD_BOTTOM = 24;
  const GAP = 10;
  const largeurBarre = (LARGEUR - GAP * (donnees.length - 1)) / donnees.length;

  return (
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
        const actif = i === donnees.length - 1;
        return (
          <a key={d.mois} href={`/documents?mois=${d.mois}#documents-envoyes`} className="group cursor-pointer">
            <rect x={x} y={PAD_TOP} width={largeurBarre} height={HAUTEUR - PAD_TOP - PAD_BOTTOM} rx={6} className="fill-[var(--app-chart-track)]" />
            <rect
              x={x}
              y={y}
              width={largeurBarre}
              height={hauteurBarre}
              rx={6}
              className={actif ? "fill-[var(--accent)]" : "fill-[var(--app-chart-fill)] transition-opacity group-hover:opacity-80"}
            >
              <title>{`${new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(d.montant)} en ${formaterMoisLong(d.mois)}`}</title>
            </rect>
            <text
              x={x + largeurBarre / 2}
              y={HAUTEUR - 6}
              textAnchor="middle"
              className={`text-[10px] ${actif ? "fill-[var(--foreground)] font-semibold" : "fill-[var(--muted)]"}`}
            >
              {formaterMoisCourt(d.mois)}
            </text>
          </a>
        );
      })}
    </svg>
  );
}

const TRACK_H = 182;

export function GraphiqueEconomiesSemaine({ donnees }: { donnees: { jour: string; montant: number }[] }) {
  const max = Math.max(...donnees.map((d) => d.montant), 1);
  const maxIndex = donnees.reduce((best, d, i, arr) => (d.montant > arr[best].montant ? i : best), 0);
  const yLabels = ["2k", "1.5k", "1k", "0.5k", "0k"];

  return (
    <div className="flex items-end gap-[23px]" role="img" aria-label="Économies détectées par jour cette semaine">
      <div className="flex h-[206px] flex-col justify-between pb-5 text-sm font-normal text-[var(--muted)]">
        {yLabels.map((label) => (
          <span key={label}>{label}</span>
        ))}
      </div>
      <div className="grid min-w-0 flex-1 grid-cols-7 gap-1.5 sm:gap-3 xl:gap-[27px]">
        {donnees.map((d, i) => {
          const fillH = d.montant > 0 ? Math.max(12, Math.round((d.montant / max) * TRACK_H)) : 0;
          const actif = i === maxIndex && d.montant > 0;
          return (
            <div key={d.jour} className="flex min-w-0 flex-col items-center gap-[9px]">
              <div className="relative w-full max-w-12 overflow-hidden rounded-[10px] bg-[var(--app-chart-track)]" style={{ height: TRACK_H }}>
                {fillH > 0 && (
                  <div
                    className={`absolute inset-x-0 bottom-0 rounded-[10px] ${actif ? "bg-[var(--accent)]" : "bg-[var(--app-chart-fill)]"}`}
                    style={{ height: fillH }}
                    title={`${new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(d.montant)}`}
                  />
                )}
              </div>
              <span className="text-sm font-normal text-[var(--muted)]">{d.jour}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function GraphiqueRepartitionDistributeurs({
  donnees,
  utiliseDemo = false,
}: {
  donnees: { distributorNorm: string; distributor: string; count: number }[];
  utiliseDemo?: boolean;
}) {
  const max = Math.max(...donnees.map((d) => d.count), 1);

  return (
    <div className="mt-4 space-y-3">
      {donnees.map((d) => (
        <Link
          key={d.distributorNorm}
          href={
            utiliseDemo
              ? "/documents?onboarding=1"
              : `/documents?hausse=1&distributeur=${encodeURIComponent(d.distributorNorm)}#documents-envoyes`
          }
          className="group block"
          title={
            utiliseDemo
              ? "Importez vos documents pour activer les hausses par distributeur"
              : `Voir les documents ${d.distributor} avec une hausse détectée (12 derniers mois)`
          }
        >
          <div className="flex items-baseline justify-between text-xs">
            <span className="font-medium text-[var(--foreground)] group-hover:text-[var(--accent)]">{d.distributor}</span>
            <span className="text-[var(--muted)]">
              {d.count} hausse{d.count > 1 ? "s" : ""}
            </span>
          </div>
          <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-[var(--app-chart-track)]">
            <div className="h-full rounded-full bg-[var(--accent)]" style={{ width: `${(d.count / max) * 100}%` }} />
          </div>
        </Link>
      ))}
    </div>
  );
}
