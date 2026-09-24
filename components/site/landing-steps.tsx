import { Reveal } from "@/components/motion/reveal";
import { InView } from "@/components/site/in-view";
import { LandingStepCard } from "@/components/site/landing-step-card";
import { STEPS } from "@/lib/site/content";
import { cn } from "@/lib/utils";

/** Grille des 3 étapes avec repère visuel entre les cartes (desktop). */
export function LandingSteps() {
  return (
    <InView className="relative mx-auto max-w-[1080px]">
      <div
        aria-hidden
        className={cn(
          "pointer-events-none absolute top-[84px] right-[calc(16.666%+24px)] left-[calc(16.666%+24px)] hidden h-px md:block",
          "bg-[linear-gradient(90deg,var(--color-line)_0%,var(--color-line)_45%,transparent_45%,transparent_55%,var(--color-line)_55%,var(--color-line)_100%)]",
          "bg-[length:12px_1px] bg-repeat-x opacity-80",
        )}
      />
      <ol className="grid list-none gap-5 md:grid-cols-3 md:gap-4">
        {STEPS.map((s, i) => (
          <li key={s.title} className="relative">
            <span
              aria-hidden
              className="absolute top-[80px] left-1/2 z-[2] hidden size-2.5 -translate-x-1/2 rounded-full border-2 border-surface bg-ink md:block"
            />
            <Reveal>
              <LandingStepCard step={i + 1} title={s.title} description={s.text} mascot={s.mascot} />
            </Reveal>
          </li>
        ))}
      </ol>
    </InView>
  );
}
