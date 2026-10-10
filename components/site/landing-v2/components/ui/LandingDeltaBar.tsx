/** Barre de comparaison visuelle pour écarts de prix (landing). */
export function LandingDeltaBar({
  status,
  delta,
}: {
  status: "over" | "ok" | "good";
  delta: string;
}) {
  const width =
    status === "good" ? "28%" : status === "over" ? Math.min(92, 40 + parseFloat(delta.replace(/[^0-9.]/g, "")) * 4) : "50%";

  const barClass =
    status === "good"
      ? "bg-emerald-500/80"
      : status === "over"
        ? "bg-[#F97316]/85"
        : "bg-ink-300";

  return (
    <div className="flex min-w-[5.5rem] flex-col items-end gap-1">
      <span className="text-xs font-medium nums text-ink-600">{delta}</span>
      <div className="h-1.5 w-full max-w-[4.5rem] overflow-hidden rounded-full bg-paper-200">
        <div className={cnBar(barClass)} style={{ width }} />
      </div>
    </div>
  );
}

function cnBar(className: string) {
  return `h-full rounded-full transition-[width,background-color] duration-500 ease-out ${className}`;
}
