"use client";

import { cn } from "@/lib/utils";

/** Atmosphère plein écran — ivoire + wash orange, un plan par étape. */
const SKY = [
  "from-[#faf8f4] via-[#fff5ef] to-[#ffe8e8]/55",
  "from-[#fff8f3] via-[#faf8f4] to-[#ffe8d4]/50",
  "from-[#fffaf6] via-[#f7f5f0] to-[#fff0e9]/70",
] as const;

export function WizardStepBg({ step, className }: { step: number; className?: string }) {
  return (
    <div
      aria-hidden
      className={cn(
        "pointer-events-none fixed inset-0 -z-10 overflow-hidden bg-landing-canvas transition-[background] duration-700 ease-out-soft",
        className,
      )}
    >
      <div
        className={cn(
          "absolute inset-0 bg-gradient-to-b transition-[background] duration-700 ease-out-soft",
          SKY[step % SKY.length],
        )}
      />
      <div className="absolute -left-[20%] top-[8%] h-[48%] w-[70%] rounded-full bg-[radial-gradient(closest-side,rgba(255,107,26,0.14),transparent)] blur-3xl" />
      <div className="absolute -right-[15%] bottom-[5%] h-[42%] w-[55%] rounded-full bg-[radial-gradient(closest-side,rgba(255,107,26,0.1),transparent)] blur-3xl" />
    </div>
  );
}
