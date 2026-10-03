import type { QuoteStatsData } from "@/components/tarineo/types";
import { cn } from "@/lib/utils";
import { ArrowUpRight, Clock, FileText, XCircle } from "lucide-react";

const TILES: {
  key: keyof QuoteStatsData;
  label: string;
  icon: typeof ArrowUpRight;
  iconBg: string;
  iconColor: string;
}[] = [
  { key: "sent", label: "envoyés", icon: ArrowUpRight, iconBg: "bg-emerald-500", iconColor: "text-white" },
  { key: "followup", label: "à relancer", icon: Clock, iconBg: "bg-[#FF6B1A]", iconColor: "text-white" },
  { key: "accepted", label: "acceptés", icon: FileText, iconBg: "bg-violet-500", iconColor: "text-white" },
  { key: "refused", label: "refusés", icon: XCircle, iconBg: "bg-red-500", iconColor: "text-white" },
];

export function QuoteStats({
  stats,
  className,
  trends,
}: {
  stats: QuoteStatsData;
  className?: string;
  trends?: Partial<Record<keyof QuoteStatsData, number>>;
}) {
  return (
    <ul className={cn("grid grid-cols-2 gap-3 p-5", className)}>
      {TILES.map(({ key, label, icon: Icon, iconBg, iconColor }) => {
        const trend = trends?.[key];
        return (
          <li
            key={key}
            className="flex items-center gap-3 rounded-2xl border border-line bg-surface px-3.5 py-3.5"
          >
            <span className={cn("grid size-10 shrink-0 place-items-center rounded-xl", iconBg)}>
              <Icon className={cn("size-[18px] stroke-[2]", iconColor)} aria-hidden />
            </span>
            <div className="min-w-0 flex-1">
              <p className="font-display text-[22px] font-semibold tabular-nums leading-none text-ink">{stats[key]}</p>
              <p className="mt-1 text-[12px] text-muted-foreground">{label}</p>
            </div>
            {trend != null ? (
              <span
                className={cn(
                  "text-[12px] font-semibold tabular-nums",
                  trend >= 0 ? "text-emerald-600" : "text-red-500",
                )}
              >
                {trend >= 0 ? "+" : ""}
                {trend} %
              </span>
            ) : null}
          </li>
        );
      })}
    </ul>
  );
}
