import { PriceHistoryChart } from "@/components/tarineo/charts/price-history-chart";
import type { PriceHistoryPoint } from "@/components/tarineo/types";
import { euro, signedPct, variation } from "@/lib/site/tarineo";

export function ProductPriceHistory({
  productName,
  points,
  showChart,
}: {
  productName: string;
  points: PriceHistoryPoint[];
  showChart?: boolean;
}) {
  if (!points.length) {
    return <p className="text-[13px] text-muted-foreground">Aucun historique de prix.</p>;
  }

  return (
    <div className="flex flex-col gap-3">
      {showChart ? <PriceHistoryChart points={points} /> : null}
      <table className="w-full text-left text-[13px]">
        <thead>
          <tr className="text-[12px] text-muted-foreground">
            <th className="pb-2 font-medium">Date</th>
            <th className="pb-2 font-medium">Distributeur</th>
            <th className="pb-2 font-medium">Prix d&apos;achat</th>
            <th className="pb-2 text-right font-medium">Variation</th>
          </tr>
        </thead>
        <tbody>
          {points.map((p, i) => {
            const prev = points[i - 1]?.priceHt;
            const pct = prev != null ? variation(prev, p.priceHt) : null;
            return (
              <tr key={`${p.date}-${i}`} className="border-t border-line">
                <td className="py-2.5 tabular-nums text-ink">{p.date}</td>
                <td className="py-2.5 text-ink">{p.label ?? "—"}</td>
                <td className="py-2.5 font-medium tabular-nums text-ink">{euro(p.priceHt)}</td>
                <td className="py-2.5 text-right">
                  {pct != null && pct !== 0 ? (
                    <span className="inline-flex rounded-full bg-[#FF6B1A]/10 px-2 py-0.5 text-[12px] font-semibold tabular-nums text-[#E85A12]">
                      {signedPct(pct)}
                    </span>
                  ) : (
                    <span className="text-muted-foreground">—</span>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
