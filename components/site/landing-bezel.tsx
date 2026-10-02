import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type LandingBezelProps = {
  children: ReactNode;
  className?: string;
  innerClassName?: string;
  /** `hero` = grand rayon éditorial ; `demo` = mock produit. */
  tone?: "hero" | "demo" | "dark";
};

/** Double cadre (coque + noyau) — profondeur physique sans ombre dure. */
export function LandingBezel({
  children,
  className,
  innerClassName,
  tone = "demo",
}: LandingBezelProps) {
  const shell =
    tone === "dark"
      ? "bg-white/[0.06] p-2 ring-1 ring-white/10"
      : "bg-ink/[0.04] p-1.5 ring-1 ring-line";
  const radius =
    tone === "hero" ? "rounded-[1.75rem]" : tone === "dark" ? "rounded-[1.75rem]" : "rounded-[1.25rem]";
  const innerRadius =
    tone === "hero"
      ? "rounded-[calc(1.75rem-0.375rem)]"
      : tone === "dark"
        ? "rounded-[calc(1.75rem-0.375rem)]"
        : "rounded-[calc(1.25rem-0.3rem)]";
  const innerBg =
    tone === "dark"
      ? "bg-bg shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]"
      : "bg-surface shadow-soft shadow-lift";

  return (
    <div className={cn("relative", shell, radius, className)}>
      <div className={cn("overflow-hidden", innerBg, innerRadius, innerClassName)}>{children}</div>
    </div>
  );
}
