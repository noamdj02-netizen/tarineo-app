"use client";

import { GlowCard } from "@/components/home/glow-card";
import { PromptBox } from "@/components/home/prompt-box";
import { cn } from "@/lib/utils";

/** Bloc « Comment puis-je t'aider » + barre de prompt. */
export function PromptHero({
  firstName,
  className,
  compact,
  landscape,
  featured,
}: {
  firstName?: string | null;
  className?: string;
  compact?: boolean;
  /** @deprecated Préférer `featured` sur le dashboard. */
  landscape?: boolean;
  /** Dashboard desktop : bloc large, empilé, typo généreuse. */
  featured?: boolean;
}) {
  const band = landscape || featured;

  return (
    <GlowCard
      tilt={!band}
      soft={band}
      className={cn(
        "flex flex-col px-5 pt-6 pb-4 sm:px-8 sm:pt-8 sm:pb-6",
        compact && "min-h-0",
        landscape &&
          !featured &&
          "gap-3 px-4 py-3.5 sm:px-5 sm:py-4 lg:grid lg:grid-cols-[minmax(0,11.5rem)_1fr] lg:items-center lg:gap-6 xl:grid-cols-[minmax(0,13rem)_1fr]",
        featured && "gap-4 px-5 py-5 sm:gap-5 sm:px-7 sm:py-6 lg:px-8 lg:py-7",
        className,
      )}
    >
      <div className={cn((landscape || featured) && "min-w-0")}>
        <p
          className={cn(
            "font-grotesk font-bold tracking-[0.14em] text-ink/75 uppercase",
            featured ? "text-[11px] sm:text-[12px]" : "text-[10px]",
          )}
        >
          Bonjour{firstName ? ` ${firstName}` : ""} !
        </p>
        <h1
          className={cn(
            "mt-1 font-display font-semibold tracking-tightest text-balance",
            featured
              ? "max-w-[28ch] text-[clamp(24px,2.8vw,36px)] leading-[1.06] sm:max-w-none"
              : landscape
                ? "text-[17px] leading-[1.15] xl:text-[19px]"
                : compact
                  ? "max-w-[16ch] text-[clamp(22px,2.2vw,30px)] leading-[1.08]"
                  : "max-w-[18ch] text-[clamp(26px,4.6vw,38px)] leading-[1.06]",
          )}
        >
          Comment puis-je t’aider aujourd’hui ?
        </h1>
      </div>
      <PromptBox
        band={band}
        large={featured}
        className={cn("min-w-0", !band && "mt-4 sm:mt-5")}
      />
    </GlowCard>
  );
}
