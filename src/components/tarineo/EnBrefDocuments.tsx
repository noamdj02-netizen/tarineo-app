import type { DocumentType } from "@prisma/client";
import { CarteResumeMotion, GrilleStatsMotion } from "@/components/tarineo/motion/GrilleStatsMotion";
import { MiniBarChart } from "@/components/tarineo/MiniBarChart";
import { cartesEnBrefParType, type StatsDocuments } from "@/lib/statsDocuments";

export function EnBrefDocuments({
  stats,
  type,
  titreSuffixe,
  cheminBase = "/documents",
}: {
  stats: StatsDocuments;
  type?: DocumentType;
  titreSuffixe?: string;
  cheminBase?: string;
}) {
  if (stats.total === 0) return null;

  const cartes = cartesEnBrefParType(stats, type);
  const barres = stats.parDistributeur.map((d) => ({
    norm: d.norm,
    label: d.label,
    count: d.count,
    href: `${cheminBase}?distributeur=${encodeURIComponent(d.norm)}#documents-envoyes`,
  }));

  return (
    <section className="mb-5">
      <p className="mb-3 text-xs font-medium uppercase tracking-wide text-muted-foreground">
        En bref{titreSuffixe ? ` — ${titreSuffixe}` : ""}
      </p>
      <div className="rounded-[20px] bg-white p-4 sm:p-5">
        <GrilleStatsMotion
          className={`grid gap-3 ${
            cartes.length === 3 ? "sm:grid-cols-3" : "sm:grid-cols-2 xl:grid-cols-4"
          }`}
        >
          {cartes.map((carte) => (
            <CarteResumeMotion
              key={carte.label}
              label={carte.label}
              valeur={carte.valeur}
              hint={carte.hint}
              accent={carte.accent}
            />
          ))}
        </GrilleStatsMotion>

        {barres.length > 0 && (
          <div className="mt-4 border-t border-border pt-4">
            <p className="mb-2 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
              Par distributeur
            </p>
            <MiniBarChart items={barres} />
          </div>
        )}
      </div>
    </section>
  );
}
