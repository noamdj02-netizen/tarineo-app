import { STAGES } from "@/lib/design-data/resources";
import { cn } from "@/lib/utils";

/** Les 6 étapes : faites en noir, en cours en gris, à venir en clair. */
export function StageBar({ stage, theme }: { stage: number; theme?: string }) {
  const st = Math.min(6, Math.max(1, stage || 1));
  return (
    <div>
      <div
        className="grid grid-cols-6 gap-1"
        role="img"
        aria-label={`Étape ${st} sur 6 : ${STAGES[st - 1]}`}
      >
        {STAGES.map((s, i) => (
          <i
            key={s}
            className={cn(
              "block h-1.5 rounded-pill",
              i + 1 < st ? "bg-ink" : i + 1 === st ? "bg-accent-2" : "bg-line",
            )}
          />
        ))}
      </div>
      <div className="mt-2 flex items-baseline justify-between gap-3 text-[13px] text-muted">
        <span>
          Étape {st}/6 : <b className="font-semibold text-ink">{STAGES[st - 1]}</b>
        </span>
        {theme ? <span className="truncate font-mono text-[11px]">{theme}</span> : null}
      </div>
    </div>
  );
}
