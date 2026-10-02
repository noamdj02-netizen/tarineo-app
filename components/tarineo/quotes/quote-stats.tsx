import type { QuoteStatsData } from "@/components/tarineo/types";
import { cn } from "@/lib/utils";

const LABELS: { key: keyof QuoteStatsData; label: string }[] = [
  { key: "sent", label: "Envoyés" },
  { key: "followup", label: "À relancer" },
  { key: "accepted", label: "Acceptés" },
  { key: "refused", label: "Refusés" },
];

export function QuoteStats({ stats, className }: { stats: QuoteStatsData; className?: string }) {
  return (
    <ul className={cn("grid grid-cols-2 gap-2 sm:grid-cols-4", className)}>
      {LABELS.map(({ key, label }) => (
        <li key={key} className="rounded-xl border border-line bg-surface px-3 py-3">
          <p className="text-[12px] text-muted-foreground">{label}</p>
          <p className="mt-1 font-display text-[22px] font-semibold tabular-nums text-ink">{stats[key]}</p>
        </li>
      ))}
    </ul>
  );
}
