import type { EtatQuota } from "@/lib/quota";
import { metriquesQuota, type VarianteQuota } from "@/lib/quotaAffichage";
import { cn } from "@/lib/utils";

const STYLES_BARRE: Record<VarianteQuota, string> = {
  historique: "bg-primary",
  mensuel: "bg-[#53616A]",
  plein: "bg-[#D64545]",
  bloque: "bg-[#D64545]",
};

const STYLES_FOND: Record<VarianteQuota, string> = {
  historique: "bg-[#FFF0E8] border-[#FFD4C2]",
  mensuel: "bg-secondary border-border",
  plein: "bg-[#FDECEC] border-[#F5C4C4]",
  bloque: "bg-[#FDECEC] border-[#F5C4C4]",
};

export function QuotaStrip({ etat, className }: { etat: EtatQuota; className?: string }) {
  const metriques = metriquesQuota(etat);
  if (!metriques) return null;

  return (
    <div
      className={cn("min-w-[148px] rounded-xl border px-3 py-2", STYLES_FOND[metriques.variante], className)}
      title={metriques.aide}
    >
      <div className="flex items-center justify-between gap-2">
        <p className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
          {etat.phase === "historique" ? "Import initial" : etat.phase === "mensuel" ? "Ce mois" : "Quota"}
        </p>
        <p className="text-sm font-semibold tabular-nums text-foreground">{metriques.libelleCourt}</p>
      </div>
      {metriques.limite > 0 && (
        <div className="mt-1.5 h-1 overflow-hidden rounded-full bg-white/70">
          <div
            className={cn("h-full rounded-full transition-[width]", STYLES_BARRE[metriques.variante])}
            style={{ width: `${metriques.pourcentage}%` }}
          />
        </div>
      )}
    </div>
  );
}
