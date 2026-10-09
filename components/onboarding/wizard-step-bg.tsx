"use client";

import { cn } from "@/lib/utils";

/** Fond pastel plein écran (réf. onboarding mobile). */
const SKY = [
  "from-[#fff0e9]/95 via-bg to-[#fff8e6]/80",
  "from-[#fff0e9]/80 via-[#fffaf3] to-[#ffe8cc]/60",
  "from-[#fff8e6]/85 via-bg to-[#fff0e9]/90",
] as const;

export function WizardStepBg({ step, className }: { step: number; className?: string }) {
  return (
    <div
      aria-hidden
      className={cn(
        "pointer-events-none fixed inset-0 -z-10 bg-gradient-to-b transition-[background] duration-700 ease-out-soft",
        SKY[step % SKY.length],
        className,
      )}
    />
  );
}
