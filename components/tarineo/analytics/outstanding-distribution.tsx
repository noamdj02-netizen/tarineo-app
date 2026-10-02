import { MiniBarChart } from "@/components/tarineo/charts/chart-primitives";
import type { FamilyPerformanceRow, SalesPoint } from "@/components/tarineo/types";

export function OutstandingDistribution({
  byFamily,
  byMonth,
}: {
  byFamily: FamilyPerformanceRow[];
  byMonth: SalesPoint[];
}) {
  return (
    <div className="grid gap-4 p-4 lg:grid-cols-2">
      <div>
        <p className="mb-2 text-[12px] font-medium text-muted-foreground">Par article (top)</p>
        <MiniBarChart
          data={byFamily.slice(0, 6).map((f) => ({ label: f.family.slice(0, 8), value: f.amountHt }))}
          barClassName="bg-ink/80"
        />
      </div>
      <div>
        <p className="mb-2 text-[12px] font-medium text-muted-foreground">Par mois</p>
        <MiniBarChart data={byMonth.map((m) => ({ label: m.label, value: m.amount }))} />
      </div>
    </div>
  );
}
