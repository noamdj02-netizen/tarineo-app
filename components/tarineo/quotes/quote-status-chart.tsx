import { DonutChart } from "@/components/tarineo/charts/chart-primitives";
import type { QuoteStatsData } from "@/components/tarineo/types";

const COLORS: Record<keyof QuoteStatsData, string> = {
  sent: "#22C55E",
  followup: "#FF6B1A",
  accepted: "#8B5CF6",
  refused: "#EF4444",
};

const LABELS: Record<keyof QuoteStatsData, string> = {
  sent: "Envoyés",
  followup: "À relancer",
  accepted: "Acceptés",
  refused: "Refusés",
};

export function QuoteStatusChart({ stats }: { stats: QuoteStatsData }) {
  const segments = (["sent", "followup", "accepted", "refused"] as const)
    .map((key) => ({
      label: LABELS[key],
      value: stats[key],
      color: COLORS[key],
    }))
    .filter((s) => s.value > 0);
  const total = segments.reduce((s, x) => s + x.value, 0);
  if (!total) {
    return <p className="px-5 py-6 text-[13px] text-muted-foreground">Aucun devis enregistré pour l’instant.</p>;
  }
  return (
    <div className="p-5">
      <DonutChart
        segments={segments}
        size={128}
        center={{ primary: String(total), secondary: "devis clients" }}
      />
    </div>
  );
}
