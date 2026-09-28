import { cn } from "@/lib/utils";

export function MetricStrip({
  items,
  className,
}: {
  items: { label: string; value: string; hint?: string }[];
  className?: string;
}) {
  if (!items.length) return null;
  return (
    <ul
      className={cn(
        "grid gap-3 sm:grid-cols-2",
        items.length >= 4 ? "lg:grid-cols-4" : items.length === 3 ? "lg:grid-cols-3" : null,
        className,
      )}
    >
      {items.map((item) => (
        <li
          key={item.label}
          className="rounded-card border border-line bg-surface px-5 py-4 shadow-soft"
        >
          <p className="text-[12px] text-muted-foreground">{item.label}</p>
          <p className="mt-1 font-display text-[16px] font-semibold tabular-nums tracking-[-0.02em] text-ink sm:text-[18px]">
            {item.value}
          </p>
          {item.hint ? (
            <p className="mt-1 text-[12px] text-muted-foreground">{item.hint}</p>
          ) : null}
        </li>
      ))}
    </ul>
  );
}
