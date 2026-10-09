import { cn } from "@/lib/utils";

/** shadcn Card — tokens landing (`.landing-v2`). */
export function landingCardClass(className?: string) {
  return cn(
    "gap-0 rounded-2xl border-line bg-paper-0 py-0 text-ink-600 shadow-sm ring-foreground/10 [--card-spacing:--spacing(5)]",
    className,
  );
}
