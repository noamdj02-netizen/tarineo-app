import type { ProjectStatus } from "@/lib/projects/types";
import { cn } from "@/lib/utils";

export function StatusBadge({ status }: { status: ProjectStatus }) {
  const focus = status === "focus";
  return (
    <span
      className={cn(
        "inline-flex flex-none items-center gap-1.5 rounded-pill px-2.5 py-1 font-mono text-[10.5px] font-medium tracking-[0.1em] uppercase",
        focus ? "bg-ink text-accent-ink shadow-dark" : "border border-line text-muted",
      )}
    >
      {focus ? <span className="size-1.5 rounded-full bg-accent-ink" aria-hidden /> : null}
      {focus ? "Focus" : "En pause"}
    </span>
  );
}
