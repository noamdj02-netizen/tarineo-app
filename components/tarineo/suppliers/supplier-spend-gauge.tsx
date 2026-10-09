import { euroInt } from "@/lib/site/tarineo";
import { spendGaugePct } from "@/lib/metier/supplier-spend";
import { cn } from "@/lib/utils";

export function SupplierSpendGauge({
  label,
  current,
  goal,
  compact,
}: {
  label: string;
  current: number;
  goal: number | null;
  compact?: boolean;
}) {
  const pct = spendGaugePct(current, goal);
  const over = goal != null && goal > 0 && current > goal;
  const near = !over && goal != null && goal > 0 && pct >= 80;
  const barTone = over ? "bg-destructive" : near ? "bg-[#FF6B1A]" : "bg-emerald-500";
  const badgeTone = over
    ? "bg-destructive/10 text-destructive"
    : near
      ? "bg-[#FF6B1A]/10 text-[#E85A12]"
      : "bg-emerald-50 text-emerald-700";

  if (goal == null || goal <= 0) {
    return (
      <div className={cn(compact ? "mt-1.5" : "mt-2")}>
        <p className="text-[12px] text-muted-foreground">
          {label} · {euroInt(current)}
          <span className="text-muted-foreground/80"> · pas d’objectif</span>
        </p>
      </div>
    );
  }

  return (
    <div className={cn(compact ? "mt-1.5" : "mt-2")}>
      <div className="mb-1 flex items-center justify-between gap-2">
        <p className="text-[12px] text-muted-foreground">{label}</p>
        <span className={cn("rounded-md px-1.5 py-0.5 text-[11px] font-semibold tabular-nums", badgeTone)}>
          {over ? `+${euroInt(current - goal)}` : `${pct} %`}
        </span>
      </div>
      <div
        className="h-1.5 overflow-hidden rounded-full bg-muted"
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={pct}
        aria-label={`${label} : ${euroInt(current)} sur ${euroInt(goal)}`}
      >
        <div className={cn("h-full rounded-full transition-[width]", barTone)} style={{ width: `${pct}%` }} />
      </div>
      <p className="mt-1 text-[12px] tabular-nums text-muted-foreground">
        <span className="font-medium text-ink">{euroInt(current)}</span>
        {" / "}
        {euroInt(goal)}
        {over ? " · plafond dépassé" : null}
      </p>
    </div>
  );
}
