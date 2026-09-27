import type { ReactNode } from "react";
import { Reveal } from "@/components/motion/reveal";
import { InView } from "@/components/site/in-view";
import { cn } from "@/lib/utils";

type LandingSectionProps = {
  id?: string;
  children: ReactNode;
  className?: string;
  /** Fond légèrement distinct (sections alternées) ; `light` = section claire (#F5F5F3, texte #111). */
  tone?: "default" | "muted" | "light";
};

export function LandingSection({ id, children, className, tone = "default" }: LandingSectionProps) {
  return (
    <section
      id={id}
      className={cn(
        "scroll-mt-24 px-4 py-16 sm:px-8 sm:py-24",
        tone === "muted" && "bg-background",
        tone === "light" && "theme-light",
        className,
      )}
    >
      {children}
    </section>
  );
}

export function LandingSectionHead({
  label,
  title,
  tail,
  text,
  align = "center",
  className,
}: {
  label: string;
  title: string;
  tail?: string;
  text?: string;
  /** Centré (défaut) ou aligné à gauche sur la grille 1080px. */
  align?: "center" | "start";
  className?: string;
}) {
  return (
    <InView
      className={cn(
        "mx-auto mb-8 flex max-w-[1080px] flex-col gap-2.5 sm:mb-10 sm:gap-3",
        align === "center" && "max-w-[640px] items-center text-center",
        align === "start" && "w-full items-start text-left",
        className,
      )}
    >
      <Reveal>
        <p className="mono-label">{`/ ${label} ///`}</p>
      </Reveal>
      <Reveal>
        <h2
          className={cn(
            "font-display text-[clamp(26px,6.2vw,42px)] leading-[1.06] font-semibold tracking-tightest text-balance text-foreground",
          )}
        >
          {title}
          {tail ? <span className="text-muted-foreground"> {tail}</span> : null}
        </h2>
      </Reveal>
      {text ? (
        <Reveal>
          <p className="text-[15px] leading-relaxed text-muted-foreground sm:text-[17px]">{text}</p>
        </Reveal>
      ) : null}
    </InView>
  );
}
