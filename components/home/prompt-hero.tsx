"use client";

import { GlowCard } from "@/components/home/glow-card";
import { PromptBox } from "@/components/home/prompt-box";
import { TarineoHdMascot } from "@/components/tarineo-hd-mascot";
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
        "relative flex flex-col px-5 pt-6 pb-4 sm:px-8 sm:pt-8 sm:pb-6",
        compact && "min-h-0",
        landscape &&
          !featured &&
          "gap-3 px-4 py-3.5 sm:px-5 sm:py-4 lg:grid lg:grid-cols-[minmax(0,11.5rem)_1fr] lg:items-center lg:gap-6 xl:grid-cols-[minmax(0,13rem)_1fr]",
        featured && "gap-4 px-5 py-5 sm:gap-5 sm:px-7 sm:py-6 lg:px-8 lg:py-7",
        className,
      )}
    >
      {featured ? (
        <TarineoHdMascot
          name="15-coucou-bord"
          priority
          className="pointer-events-none absolute top-0 right-2 z-10 h-[140px] w-[120px] sm:right-4 sm:h-[163px] sm:w-[140px]"
        />
      ) : null}
      <div className={cn((landscape || featured) && "min-w-0", featured && "pr-[7.5rem] sm:pr-[9.5rem]")}>
        <p
          className={cn(
            "font-mono font-medium tracking-[0.12em] text-muted-foreground uppercase",
            featured ? "text-[11px]" : "text-[10px]",
          )}
        >
          {new Date().toLocaleDateString("fr-FR", {
            weekday: "long",
            day: "numeric",
            month: "long",
          })}
        </p>
        <h1
          className={cn(
            "mt-1.5 font-display font-semibold tracking-tightest text-balance",
            featured
              ? "max-w-[22ch] text-[clamp(28px,3.2vw,40px)] leading-[1.04] sm:max-w-none"
              : landscape
                ? "text-[18px] leading-[1.15] xl:text-[20px]"
                : compact
                  ? "max-w-[16ch] text-[clamp(22px,2.2vw,30px)] leading-[1.08]"
                  : "max-w-[16ch] text-[clamp(28px,5vw,40px)] leading-[1.04]",
          )}
        >
          Bonjour{firstName ? `, ${firstName}` : ""}
        </h1>
        <p
          className={cn(
            "mt-1.5 max-w-[36ch] text-muted-foreground",
            featured ? "text-[15px] leading-snug sm:text-[16px]" : "text-[14.5px] leading-snug",
          )}
        >
          Quels prix ont bougé aujourd’hui ?
        </p>
      </div>
      <PromptBox
        band={band}
        large={featured}
        className={cn("min-w-0", !band && "mt-4 sm:mt-5")}
      />
    </GlowCard>
  );
}
