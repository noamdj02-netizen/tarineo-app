import type { ReactNode } from "react";
import { Reveal } from "@/components/motion/reveal";
import { InView } from "@/components/site/in-view";
import { LandingStackHeadline } from "@/components/site/landing-stack-headline";
import { cn } from "@/lib/utils";

type LandingSectionProps = {
  id?: string;
  children: ReactNode;
  className?: string;
  lead?: boolean;
  narrow?: boolean;
  /** @deprecated Conservé pour les pages legacy — ignoré sur la home. */
  tone?: "default" | "muted" | "light";
};

export function LandingSection({
  id,
  children,
  className,
  lead = false,
  narrow = false,
}: LandingSectionProps) {
  return (
    <section
      id={id}
      className={cn(
        "scroll-mt-28 border-t border-line",
        lead && "border-t-0 pt-4",
        className,
      )}
    >
      <div
        className={cn(
          "mx-auto px-4 py-20 sm:px-8 sm:py-24 lg:py-32",
          narrow ? "max-w-[820px]" : "max-w-[1180px]",
        )}
      >
        {children}
      </div>
    </section>
  );
}

export function LandingSectionHead({
  label,
  chapter,
  title,
  tail,
  text,
  align = "start",
  size = "lg",
  stackedTail = false,
  className,
}: {
  label?: string;
  /** Numéro de chapitre éditorial (ex. « 01 »). */
  chapter?: string;
  title: string;
  tail?: string;
  text?: string;
  align?: "center" | "start";
  size?: "lg" | "md";
  /** Deux lignes + marqueur orange sur `tail` (sections éditoriales). */
  stackedTail?: boolean;
  className?: string;
}) {
  return (
    <InView
      stagger={0.05}
      className={cn(
        "relative flex flex-col gap-3 sm:gap-4",
        size === "lg" ? "mb-12 sm:mb-14 lg:mb-16" : "mb-10 sm:mb-11",
        align === "center" && "mx-auto max-w-prose items-center text-center",
        align === "start" && "max-w-prose items-start text-left",
        className,
      )}
    >
      {chapter ? (
        <Reveal>
          <p
            aria-hidden
            className="font-display text-[13px] font-semibold tabular-nums tracking-[0.12em] text-landing-chapter"
          >
            {chapter}
          </p>
        </Reveal>
      ) : null}
      {label ? (
        <Reveal>
          <p className="mono-label text-landing-ink-muted">{label}</p>
        </Reveal>
      ) : null}
      <Reveal>
        {stackedTail && tail ? (
          <LandingStackHeadline lead={title} tail={tail} />
        ) : (
          <h2
            className={cn(
              "font-display font-semibold tracking-[-0.034em] text-balance text-ink",
              size === "lg" && "text-[clamp(28px,4.5vw,44px)] leading-[1.06]",
              size === "md" && "text-[clamp(24px,3.8vw,34px)] leading-[1.1]",
            )}
          >
            {title}
            {tail ? (
              <span className="font-display font-semibold italic tracking-[-0.03em]"> {tail}</span>
            ) : null}
          </h2>
        )}
      </Reveal>
      {text ? (
        <Reveal>
          <p className="max-w-prose text-[16px] leading-[1.65] tracking-[-0.01em] text-landing-ink-muted text-pretty sm:text-[17px]">
            {text}
          </p>
        </Reveal>
      ) : null}
    </InView>
  );
}
