import { MiniBarChart } from "@/components/tarineo/charts/chart-primitives";
import type { SalesPoint } from "@/components/tarineo/types";

export function SalesEvolutionChart({ points }: { points: SalesPoint[] }) {
  if (!points.length) {
    return <p className="p-4 text-[13px] text-muted-foreground">Pas de données sur la période.</p>;
  }
  return (
    <div className="p-4">
      <MiniBarChart data={points.map((p) => ({ label: p.label, value: p.amount }))} />
    </div>
  );
}
