"use client";

import { cn } from "@/lib/utils";

/** Fond pastel plein écran (réf. onboarding mobile). */
const SKY = [
  "from-[#dceef8]/90 via-bg to-[#f8f4e8]/80",
  "from-[#f8f0d4]/85 via-bg to-[#e8f4fc]/75",
  "from-[#ebe4fb]/80 via-bg to-[#f5efe8]/85",
  "from-[#f5ebe4]/85 via-bg to-[#e4ecf8]/80",
  "from-[#e8f2fa]/75 via-[#f6f0ff]/50 to-[#faf6ee]/90",
] as const;

export function WizardStepBg({ step, className }: { step: number; className?: string }) {
  return (
    <div
      aria-hidden
      className={cn(
        "pointer-events-none fixed inset-0 -z-10 bg-gradient-to-b transition-[background] duration-700 ease-out-soft lg:hidden",
        SKY[step] ?? SKY[0],
        className,
      )}
    />
  );
}
