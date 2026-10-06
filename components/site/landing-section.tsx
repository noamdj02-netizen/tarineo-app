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
        "scroll-mt-28 border-t border-black/[0.06]",
        lead && "border-t-0 pt-4",
        className,
      )}
    >
      <div
        className={cn(
          "mx-auto px-4 py-20 sm:px-8 sm:py-24 lg:py-32",
          narrow ? "max-w-[820px]" : "max-w-[1240px]",
        )}
      >
        {children}
      </div>
    </section>
  );
}

/** Chapitre produit : titre sticky à gauche, démo pleine largeur à droite (desktop). */
export function LandingSectionEditorial({
  head,
  children,
  className,
  flip = false,
}: {
  head: ReactNode;
  children: ReactNode;
  className?: string;
  /** Démo à gauche sur grands écrans (alternance visuelle). */
  flip?: boolean;
}) {
  return (
    <div
      className={cn(
        "grid gap-10 lg:grid-cols-12 lg:items-start lg:gap-x-14 xl:gap-x-16",
        flip && "lg:[&>div:first-child]:order-2 lg:[&>div:last-child]:order-1",
        className,
      )}
    >
      <div className="lg:col-span-4 lg:sticky lg:top-28 lg:self-start">{head}</div>
      <div className="min-w-0 lg:col-span-8">{children}</div>
    </div>
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
        align === "start" && "max-w-[34rem] items-start text-left lg:max-w-none",
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
              size === "lg" &&
                "font-[family-name:var(--font-grotesk)] text-[clamp(30px,4.8vw,52px)] leading-[1.04]",
              size === "md" &&
                "font-[family-name:var(--font-grotesk)] text-[clamp(26px,4vw,40px)] leading-[1.08]",
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
