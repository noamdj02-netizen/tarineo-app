import type { TarineoDistributor } from "@/components/tarineo/types";
import { SupplierSpendGauge } from "@/components/tarineo/suppliers/supplier-spend-gauge";
import { euroInt } from "@/lib/site/tarineo";

export function DistributorSummary({ distributor }: { distributor: TarineoDistributor }) {
  const current = distributor.amountHt ?? 0;
  const goal = distributor.goalHt ?? 0;
  const monthly = distributor.monthlyAmountHt ?? 0;
  const monthlyGoal = distributor.monthlyGoalHt ?? null;
  const remaining = goal > 0 ? Math.max(0, goal - current) : 0;
  const pct = goal > 0 ? Math.min(100, Math.round((current / goal) * 100)) : 0;
  return (
    <div className="flex flex-col gap-4 p-4">
      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <p className="text-[12px] text-muted-foreground">Objectif annuel</p>
          <p className="font-display text-[22px] font-semibold tabular-nums">{goal ? euroInt(goal) : "—"}</p>
        </div>
        <div>
          <p className="text-[12px] text-muted-foreground">Achats année</p>
          <p className="font-display text-[22px] font-semibold tabular-nums">{euroInt(current)}</p>
        </div>
        <div>
          <p className="text-[12px] text-muted-foreground">Reste annuel</p>
          <p className="font-display text-[22px] font-semibold tabular-nums">{goal ? euroInt(remaining) : "—"}</p>
        </div>
        <div>
          <p className="text-[12px] text-muted-foreground">Progression année</p>
          <p className="font-display text-[22px] font-semibold tabular-nums">{goal ? `${pct} %` : "—"}</p>
        </div>
      </div>
      <SupplierSpendGauge label="Ce mois" current={monthly} goal={monthlyGoal} />
      <SupplierSpendGauge label="Cette année" current={current} goal={goal > 0 ? goal : null} />
    </div>
  );
}
