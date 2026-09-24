import type { ReactNode } from "react";
import { Reveal } from "@/components/motion/reveal";
import { InView } from "@/components/site/in-view";
import { cn } from "@/lib/utils";

type LandingSectionProps = {
  id?: string;
  children: ReactNode;
  className?: string;
  /** Fond légèrement distinct (sections alternées). */
  tone?: "default" | "muted";
};

export function LandingSection({ id, children, className, tone = "default" }: LandingSectionProps) {
  return (
    <section
      id={id}
      className={cn(
        "scroll-mt-24 px-5 py-20 sm:px-8",
        tone === "muted" && "bg-background",
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
  className,
}: {
  label: string;
  title: string;
  tail?: string;
  text?: string;
  className?: string;
}) {
  return (
    <InView className={cn("mx-auto mb-10 flex max-w-[640px] flex-col items-center gap-3 text-center", className)}>
      <Reveal>
        <p className="mono-label">{`/ ${label} ///`}</p>
      </Reveal>
      <Reveal>
        <h2 className="font-display text-[clamp(28px,4.4vw,42px)] leading-[1.05] font-semibold tracking-tightest text-balance">
          {title}
          {tail ? <span className="text-accent-2"> {tail}</span> : null}
        </h2>
      </Reveal>
      {text ? (
        <Reveal>
          <p className="text-base leading-relaxed text-muted-foreground">{text}</p>
        </Reveal>
      ) : null}
    </InView>
  );
}
