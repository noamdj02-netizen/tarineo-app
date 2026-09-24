import type { ProjectStatus } from "@/lib/projects/types";
import { cn } from "@/lib/utils";

export const STATUS_LABEL: Record<ProjectStatus, string> = {
  focus: "Focus",
  pause: "En pause",
  fini: "Fini",
};

export const STATUS_TITLE: Record<ProjectStatus, string> = {
  focus: "Projet en focus",
  pause: "Projet en pause",
  fini: "Projet fini",
};

export function toStatus(v: unknown): ProjectStatus {
  return v === "focus" || v === "fini" ? v : "pause";
}

const STYLE: Record<ProjectStatus, { pill: string; dot: string }> = {
  focus: {
    pill: "bg-st-focus-soft text-st-focus-ink ring-st-focus/20",
    dot: "bg-st-focus shadow-[0_0_0_3px_color-mix(in_srgb,var(--color-st-focus)_22%,transparent)]",
  },
  pause: {
    pill: "bg-st-pause-soft text-st-pause-ink ring-st-pause/25",
    dot: "bg-st-pause shadow-[0_0_0_3px_color-mix(in_srgb,var(--color-st-pause)_25%,transparent)]",
  },
  fini: {
    pill: "bg-st-fini-soft text-st-fini-ink ring-st-fini/20",
    dot: "bg-st-fini shadow-[0_0_0_3px_color-mix(in_srgb,var(--color-st-fini)_22%,transparent)]",
  },
};

export function StatusBadge({ status }: { status: ProjectStatus }) {
  const s = STYLE[status] ?? STYLE.pause;
  return (
    <span
      className={cn(
        "inline-flex flex-none items-center gap-2 rounded-pill px-2.5 py-1 font-mono text-[10.5px] font-medium tracking-[0.1em] uppercase ring-1 ring-inset",
        s.pill,
      )}
    >
      <span className={cn("size-1.5 rounded-full", s.dot)} aria-hidden />
      {STATUS_LABEL[status] ?? STATUS_LABEL.pause}
    </span>
  );
}
