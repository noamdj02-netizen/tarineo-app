import type { TarineoDistributor } from "@/components/tarineo/types";
import { euroInt } from "@/lib/site/tarineo";

export function DistributorSummary({ distributor }: { distributor: TarineoDistributor }) {
  const current = distributor.amountHt ?? 0;
  const goal = distributor.goalHt ?? 0;
  const remaining = goal > 0 ? Math.max(0, goal - current) : 0;
  const pct = goal > 0 ? Math.min(100, Math.round((current / goal) * 100)) : 0;
  return (
    <div className="grid gap-3 p-4 sm:grid-cols-2">
      <div>
        <p className="text-[12px] text-muted-foreground">Objectif annuel</p>
        <p className="font-display text-[22px] font-semibold tabular-nums">{goal ? euroInt(goal) : "—"}</p>
      </div>
      <div>
        <p className="text-[12px] text-muted-foreground">Encours achats</p>
        <p className="font-display text-[22px] font-semibold tabular-nums">{euroInt(current)}</p>
      </div>
      <div>
        <p className="text-[12px] text-muted-foreground">Reste à atteindre</p>
        <p className="font-display text-[22px] font-semibold tabular-nums">{goal ? euroInt(remaining) : "—"}</p>
      </div>
      <div>
        <p className="text-[12px] text-muted-foreground">Progression</p>
        <p className="font-display text-[22px] font-semibold tabular-nums">{goal ? `${pct} %` : "—"}</p>
      </div>
    </div>
  );
}
