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
        "scroll-mt-28 px-4 py-20 sm:px-8 sm:py-28",
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
  align?: "center" | "start";
  className?: string;
}) {
  return (
    <InView
      stagger={0.05}
      className={cn(
        "mx-auto mb-12 flex max-w-[1080px] flex-col gap-3 sm:mb-14 sm:gap-4",
        align === "center" && "max-w-[760px] items-center text-center",
        align === "start" && "w-full items-start text-left",
        className,
      )}
    >
      <Reveal>
        <p className="text-[13px] font-medium tracking-[-0.01em] text-[#6E6E6E] sm:text-[14px]">
          {label}
        </p>
      </Reveal>
      <Reveal>
        <h2
          className={cn(
            "font-display text-[clamp(28px,5.5vw,48px)] leading-[1.05] font-semibold tracking-[-0.03em] text-balance text-[#0A0A0A]",
          )}
        >
          {title}
          {tail ? <> {tail}</> : null}
        </h2>
      </Reveal>
      {text ? (
        <Reveal>
          <p className="max-w-[52ch] text-[16px] leading-[1.55] text-[#6E6E6E] text-pretty sm:text-[18px]">
            {text}
          </p>
        </Reveal>
      ) : null}
    </InView>
  );
}
