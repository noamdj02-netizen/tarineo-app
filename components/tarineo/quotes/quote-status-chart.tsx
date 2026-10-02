import { DonutChart } from "@/components/tarineo/charts/chart-primitives";
import type { QuoteStatsData } from "@/components/tarineo/types";

const COLORS = ["#FF6B1A", "#F59E0B", "#16A34A", "#94A3B8"];

export function QuoteStatusChart({ stats }: { stats: QuoteStatsData }) {
  const segments = [
    { label: "Envoyés", value: stats.sent, color: COLORS[0] },
    { label: "À relancer", value: stats.followup, color: COLORS[1] },
    { label: "Acceptés", value: stats.accepted, color: COLORS[2] },
    { label: "Refusés", value: stats.refused, color: COLORS[3] },
  ].filter((s) => s.value > 0);
  if (!segments.length) {
    return <p className="px-4 py-6 text-[13px] text-muted-foreground">Aucun devis enregistré pour l’instant.</p>;
  }
  return (
    <div className="p-4">
      <DonutChart segments={segments} />
    </div>
  );
}
