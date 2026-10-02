import { PriceHistoryChart } from "@/components/tarineo/charts/price-history-chart";
import type { PriceHistoryPoint } from "@/components/tarineo/types";
import { signedPct, variation } from "@/lib/site/tarineo";
import { StatusBadge } from "@/components/tarineo/status-badge";

export function ProductPriceHistory({
  productName,
  points,
}: {
  productName: string;
  points: PriceHistoryPoint[];
}) {
  const first = points[0]?.priceHt;
  const last = points[points.length - 1]?.priceHt;
  const pct = first != null && last != null ? variation(first, last) : 0;
  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-line px-4 py-3">
        <p className="font-medium text-ink">{productName}</p>
        {points.length >= 2 ? <StatusBadge label={signedPct(pct)} tone={pct > 0 ? "warn" : "ok"} /> : null}
      </div>
      <PriceHistoryChart points={points} />
    </div>
  );
}
