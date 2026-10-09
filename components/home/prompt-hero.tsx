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
  /** Bloc widget accueil (colonne étroite) : mascotte calée au bord, sans débord. */
  inWidget,
}: {
  firstName?: string | null;
  className?: string;
  compact?: boolean;
  /** @deprecated Préférer `featured` sur le dashboard. */
  landscape?: boolean;
  /** Dashboard desktop : bloc large, empilé, typo généreuse. */
  featured?: boolean;
  inWidget?: boolean;
}) {
  const band = landscape || featured;
  const showMascot = featured;

  return (
    <GlowCard
      tilt={!band && !inWidget}
      soft={band}
      className={cn(
        "relative flex flex-col px-5 pt-6 pb-4 sm:px-8 sm:pt-8 sm:pb-6",
        compact && "min-h-0",
        landscape &&
          !featured &&
          "gap-3 px-4 py-3.5 sm:px-5 sm:py-4 lg:grid lg:grid-cols-[minmax(0,11.5rem)_1fr] lg:items-center lg:gap-6 xl:grid-cols-[minmax(0,13rem)_1fr]",
        featured &&
          !inWidget &&
          "gap-4 px-5 py-5 sm:gap-5 sm:px-7 sm:py-6 lg:px-8 lg:py-7",
        featured &&
          inWidget &&
          "gap-3 px-4 py-4 sm:gap-4 sm:px-5 sm:py-5",
        className,
      )}
    >
      {showMascot ? (
        <TarineoHdMascot
          name="15-coucou-bord"
          priority
          imageClassName="object-contain object-right-bottom"
          className={cn(
            "pointer-events-none absolute z-10 flex items-end justify-end",
            inWidget
              ? "top-0 right-0 h-[112px] w-[96px] sm:h-[120px] sm:w-[104px]"
              : "top-0 right-2 h-[140px] w-[120px] sm:right-4 sm:h-[163px] sm:w-[140px]",
          )}
        />
      ) : null}
      <div
        className={cn(
          (landscape || featured) && "min-w-0",
          featured && !inWidget && "pr-[7.5rem] sm:pr-[9.5rem]",
          featured && inWidget && "pr-[5.5rem] sm:pr-[6.25rem]",
        )}
      >
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
        {/* h2 : le h1 Accueil reste dans PageHeader (un seul greeting document). */}
        <h2
          className={cn(
            "mt-1.5 font-display font-semibold tracking-tightest text-balance",
            featured && inWidget
              ? "max-w-[14ch] text-[clamp(22px,5vw,28px)] leading-[1.08]"
              : featured
              ? "max-w-[22ch] text-[clamp(28px,3.2vw,40px)] leading-[1.04] sm:max-w-none"
              : landscape
                ? "text-[18px] leading-[1.15] xl:text-[20px]"
                : compact
                  ? "max-w-[16ch] text-[clamp(22px,2.2vw,30px)] leading-[1.08]"
                  : "max-w-[16ch] text-[clamp(28px,5vw,40px)] leading-[1.04]",
          )}
        >
          Quels prix ont bougé ?
        </h2>
        <p
          className={cn(
            "mt-1.5 max-w-[36ch] text-muted-foreground",
            featured ? "text-[15px] leading-snug sm:text-[16px]" : "text-[14.5px] leading-snug",
          )}
        >
          {firstName ? `${firstName}, d` : "D"}emandez à l’assistant — sans inventer de prix.
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
