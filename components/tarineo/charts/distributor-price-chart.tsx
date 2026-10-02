import { MiniBarChart } from "@/components/tarineo/charts/chart-primitives";

export function DistributorPriceChart({
  distributors,
}: {
  distributors: { name: string; total: number }[];
}) {
  if (!distributors.length) {
    return <p className="p-4 text-[13px] text-muted-foreground">Aucun achat par distributeur.</p>;
  }
  return (
    <div className="p-4">
      <MiniBarChart
        data={distributors.map((d) => ({
          label: d.name.length > 10 ? `${d.name.slice(0, 9)}…` : d.name,
          value: d.total,
        }))}
      />
    </div>
  );
}
