import { ProductPriceTrendChart } from "@/components/tarineo/charts/product-price-trend-chart";
import type { PriceHistoryPoint } from "@/components/tarineo/types";

export function PriceHistoryChart({ points }: { points: PriceHistoryPoint[] }) {
  return <ProductPriceTrendChart points={points} />;
}
