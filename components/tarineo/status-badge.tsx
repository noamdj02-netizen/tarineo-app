import { cn } from "@/lib/utils";

const TONES = {
  focus: "bg-st-focus-soft text-st-focus-ink",
  pause: "bg-st-pause-soft text-st-pause-ink",
  fini: "bg-st-fini-soft text-st-fini-ink",
  warn: "bg-tarineo-orange-soft text-tarineo-orange",
  muted: "bg-surface text-muted-foreground",
  ok: "bg-st-focus-soft text-st-focus-ink",
} as const;

const DOTS = {
  focus: "bg-st-focus",
  pause: "bg-st-pause",
  fini: "bg-st-fini",
  warn: "bg-nav-orange",
  muted: "bg-muted-foreground/50",
  ok: "bg-st-focus",
} as const;

export type StatusTone = keyof typeof TONES;

export function StatusBadge({
  label,
  tone = "muted",
  className,
}: {
  label: string;
  tone?: StatusTone;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border-0 px-2.5 py-0.5 text-[12px] font-medium",
        TONES[tone],
        className,
      )}
    >
      <span aria-hidden className={cn("size-1.5 shrink-0 rounded-full", DOTS[tone])} />
      {label}
    </span>
  );
}

export function chantierTone(status: "focus" | "pause" | "fini"): StatusTone {
  return status;
}
