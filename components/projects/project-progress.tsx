import { progressPercent } from "@/lib/projects/next-meta";

/** Progression dérivée des fonctions + tâches existantes. */
export function ProjectProgress({
  featuresDone,
  featuresTotal,
  tasksDone,
  tasksTotal,
}: {
  featuresDone: number;
  featuresTotal: number;
  tasksDone: number;
  tasksTotal: number;
}) {
  if (!featuresTotal && !tasksTotal) return null;
  const pct = progressPercent(featuresDone, featuresTotal, tasksDone, tasksTotal) ?? 0;

  return (
    <div className="space-y-2">
      <div className="flex items-baseline justify-between gap-3">
        <span className="font-mono text-[10.5px] tracking-[0.12em] text-muted-foreground uppercase">
          Progression
        </span>
        <span className="font-mono text-[12px] font-medium tabular-nums text-ink">{pct}&nbsp;%</span>
      </div>
      <div
        className="h-1.5 overflow-hidden rounded-pill bg-line"
        role="progressbar"
        aria-valuenow={pct}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={`Progression ${pct} pour cent`}
      >
        <div
          className="h-full rounded-pill bg-ink transition-[width] duration-200 ease-out-soft"
          style={{ width: `${pct}%` }}
        />
      </div>
      <p className="text-[12.5px] text-muted-foreground">
        {featuresTotal ? (
          <span>
            {featuresDone}/{featuresTotal} fonctionnalités
          </span>
        ) : null}
        {featuresTotal && tasksTotal ? <span aria-hidden> · </span> : null}
        {tasksTotal ? (
          <span>
            {tasksDone}/{tasksTotal} tâches
          </span>
        ) : null}
      </p>
    </div>
  );
}
