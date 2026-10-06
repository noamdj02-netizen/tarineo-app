import type { ReactNode } from "react";

type Tone = "accent" | "muted" | "success" | "warning" | "dark";

const tones: Record<Tone, string> = {
  accent: "bg-accent-soft text-accent-700",
  muted: "bg-paper-50 text-ink-400 border border-line",
  success: "bg-success-soft text-success",
  warning: "bg-warning-soft text-warning",
  dark: "bg-ink-900 text-white",
};

const dots: Record<Tone, string> = {
  accent: "bg-accent",
  muted: "bg-ink-300",
  success: "bg-success",
  warning: "bg-warning",
  dark: "bg-white",
};

export function Badge({
  children,
  tone = "muted",
  dot = false,
  className = "",
}: {
  children: ReactNode;
  tone?: Tone;
  dot?: boolean;
  className?: string;
}) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium nums ${tones[tone]} ${className}`}
    >
      {dot ? <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${dots[tone]}`} aria-hidden="true" /> : null}
      {children}
    </span>
  );
}