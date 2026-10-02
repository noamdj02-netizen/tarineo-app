import { MiniLineChart } from "@/components/tarineo/charts/chart-primitives";
import type { PriceHistoryPoint } from "@/components/tarineo/types";

export function PriceHistoryChart({ points }: { points: PriceHistoryPoint[] }) {
  if (points.length < 2) {
    return <p className="p-4 text-[13px] text-muted-foreground">Historique insuffisant pour ce produit.</p>;
  }
  const series = points.map((p, i) => ({ x: i, y: p.priceHt }));
  return (
    <div className="p-4">
      <MiniLineChart points={series} />
    </div>
  );
}
