import { cn } from "@/lib/utils";

export function Choice({
  active,
  title,
  hint,
  onClick,
}: {
  active: boolean;
  title: string;
  hint?: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        "pressable min-h-11 rounded-2xl border px-3.5 py-2.5 text-left transition-colors sm:px-4 sm:py-3",
        active
          ? "border-ink bg-ink text-accent-ink"
          : "border-line bg-surface-2/80 text-ink hover:bg-surface-2",
      )}
    >
      <span className="block text-[15px] font-medium leading-snug">{title}</span>
      {hint ? (
        <span
          className={cn(
            "mt-0.5 block text-[13px] leading-snug line-clamp-2",
            active ? "text-accent-ink/70" : "text-muted-foreground",
          )}
        >
          {hint}
        </span>
      ) : null}
    </button>
  );
}
