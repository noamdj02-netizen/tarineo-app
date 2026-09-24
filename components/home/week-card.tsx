import type { WeekStats } from "@/lib/home/week";
import { cn } from "@/lib/utils";

/** Ma semaine : barres d'activité des 7 derniers jours + compteurs. */
export function WeekCard({ stats, compact }: { stats: WeekStats; compact?: boolean }) {
  const { days, totals, tasks } = stats;
  const max = Math.max(1, ...days.map((d) => d.ai + d.schemas + d.notes));
  const pct = tasks.total ? Math.round((tasks.done / tasks.total) * 100) : 0;
  const rows = [
    { label: "Questions à l’IA", value: totals.ai, dot: "bg-glow-2" },
    { label: "Schémas modifiés", value: totals.schemas, dot: "bg-glow-3" },
    { label: "Notes de journal", value: totals.notes, dot: "bg-glow-1" },
  ];

  if (compact) {
    return (
      <section
        className="card-soft flex flex-col gap-3 p-3.5 sm:flex-row sm:items-center sm:gap-6 sm:p-4"
        aria-label="Ma semaine"
      >
        <div className="min-w-0 shrink-0 sm:w-[140px]">
          <p className="mono-label">{"/ Ma semaine ///"}</p>
          <p className="mt-0.5 font-display text-[18px] font-semibold leading-tight tracking-tight">
            {totals.ai + totals.schemas + totals.notes}
            <span className="text-muted-foreground"> / 7j</span>
          </p>
        </div>
        <div className="flex h-[56px] min-w-0 flex-1 items-end gap-1.5" role="img" aria-label="Activité">
          {days.map((d, i) => {
            const total = d.ai + d.schemas + d.notes;
            return (
              <div key={d.key} className="flex h-full flex-1 flex-col justify-end gap-1">
                <div className="flex w-full flex-1 flex-col justify-end overflow-hidden rounded-md bg-surface-2">
                  <div
                    className="w-full rounded-md bg-ink/80"
                    style={{ height: `${(total / max) * 100}%`, minHeight: total ? 4 : 0 }}
                  />
                </div>
                <span
                  className={cn(
                    "text-center font-mono text-[9px] uppercase",
                    i === days.length - 1 ? "font-semibold text-ink" : "text-muted-foreground",
                  )}
                >
                  {d.label}
                </span>
              </div>
            );
          })}
        </div>
        <p className="hidden font-mono text-[11px] text-muted-foreground sm:block sm:w-16 sm:text-right">
          {tasks.done}/{tasks.total} tâches
        </p>
      </section>
    );
  }

  return (
    <section
      className="card-soft grid gap-5 p-4 sm:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)] sm:p-5"
      aria-label="Ma semaine"
    >
      <div className="flex flex-col gap-4">
        <div>
          <p className="mono-label">{"/ Ma semaine ///"}</p>
          <h2 className="mt-1 font-display text-[22px] leading-none font-semibold tracking-tight">
            {totals.ai + totals.schemas + totals.notes} actions
            <span className="text-muted-foreground"> en 7 jours</span>
          </h2>
        </div>

        {/* barres empilées par jour */}
        <div
          className="flex h-[132px] items-end gap-2"
          role="img"
          aria-label="Activité par jour"
        >
          {days.map((d, i) => {
            const total = d.ai + d.schemas + d.notes;
            const today = i === days.length - 1;
            return (
              <div
                key={d.key}
                className="flex h-full flex-1 flex-col items-center gap-1.5"
              >
                <div className="flex w-full flex-1 flex-col justify-end overflow-hidden rounded-lg bg-surface-2">
                  <div
                    className="flex w-full origin-bottom animate-[bar-grow_0.7s_var(--ease-out-soft)_both] flex-col-reverse"
                    style={{
                      height: `${(total / max) * 100}%`,
                      animationDelay: `${i * 50}ms`,
                    }}
                  >
                    {total ? (
                      <>
                        <span
                          className="bg-glow-2"
                          style={{ flexGrow: d.ai }}
                        />
                        <span
                          className="bg-glow-3"
                          style={{ flexGrow: d.schemas }}
                        />
                        <span
                          className="bg-glow-1"
                          style={{ flexGrow: d.notes }}
                        />
                      </>
                    ) : null}
                  </div>
                </div>
                <span
                  className={cn(
                    "font-mono text-[10.5px] uppercase",
                    today ? "font-semibold text-ink" : "text-muted-foreground",
                  )}
                >
                  {d.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      <div className="flex flex-col gap-4 sm:justify-end">
        <ul className="flex flex-col gap-2 text-[13.5px]">
          {rows.map((r) => (
            <li key={r.label} className="flex items-center gap-2.5">
              <span
                className={cn("size-2.5 rounded-full", r.dot)}
                aria-hidden
              />
              <span className="text-ink/80">{r.label}</span>
              <span className="ml-auto font-mono text-[12.5px] tabular-nums">
                {r.value}
              </span>
            </li>
          ))}
        </ul>

        <div className="border-t border-line pt-3">
          <div className="flex items-baseline justify-between text-[13px]">
            <span className="text-ink/80">Tâches faites, tous projets</span>
            <span className="font-mono text-[12.5px] tabular-nums">
              {tasks.done}/{tasks.total}
            </span>
          </div>
          <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-surface-2">
            <div
              className="h-full origin-left animate-[bar-grow-x_0.9s_var(--ease-out-soft)_both] rounded-full bg-ink"
              style={{ width: `${pct}%` }}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
