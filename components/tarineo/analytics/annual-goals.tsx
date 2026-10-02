import type { TarineoDistributor } from "@/components/tarineo/types";
import { euroInt } from "@/lib/site/tarineo";

export function AnnualGoals({ distributors }: { distributors: TarineoDistributor[] }) {
  if (!distributors.length) {
    return <p className="p-4 text-[13px] text-muted-foreground">Importez des factures pour suivre vos objectifs.</p>;
  }
  return (
    <ul className="divide-y divide-line">
      {distributors.map((d) => {
        const goal = d.goalHt ?? 0;
        const current = d.amountHt ?? 0;
        const pct = goal > 0 ? Math.min(100, Math.round((current / goal) * 100)) : 0;
        return (
          <li key={d.id} className="px-4 py-3">
            <div className="flex items-center justify-between gap-2 text-[14px]">
              <span className="font-medium text-ink">{d.name}</span>
              <span className="tabular-nums text-muted-foreground">
                {euroInt(current)}
                {goal ? ` / ${euroInt(goal)}` : ""}
              </span>
            </div>
            {goal > 0 ? (
              <div className="mt-2 h-2 overflow-hidden rounded-full bg-muted">
                <div className="h-full rounded-full bg-[#FF6B1A]" style={{ width: `${pct}%` }} />
              </div>
            ) : null}
            {goal > 0 ? <p className="mt-1 text-[12px] text-muted-foreground">{pct} % de l’objectif estimé</p> : null}
          </li>
        );
      })}
    </ul>
  );
}
