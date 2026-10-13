import type { ReactNode } from "react";
import { Reveal } from "@/components/motion/reveal";
import { InView } from "@/components/site/in-view";
import { cn } from "@/lib/utils";

type LandingSectionProps = {
  id?: string;
  children: ReactNode;
  className?: string;
  tone?: "default" | "muted" | "light";
};

export function LandingSection({ id, children, className, tone = "default" }: LandingSectionProps) {
  return (
    <section
      id={id}
      className={cn(
        "scroll-mt-24 px-4 py-16 sm:px-8 sm:py-24",
        tone === "muted" && "bg-background",
        tone === "light" && "bg-white",
        className,
      )}
    >
      {children}
    </section>
  );
}

export function LandingBadge({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex rounded-pill bg-brand-orange px-3.5 py-1.5 text-[13px] font-semibold text-white",
        className,
      )}
    >
      {children}
    </span>
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
      className={cn(
        "mx-auto mb-10 flex max-w-[760px] flex-col gap-3 sm:mb-12",
        align === "center" && "items-center text-center",
        align === "start" && "w-full max-w-none items-start text-left",
        className,
      )}
    >
      <Reveal>
        <LandingBadge>{label}</LandingBadge>
      </Reveal>
      <Reveal>
        <h2 className="font-display text-[clamp(26px,4.2vw,38px)] leading-[1.15] font-semibold tracking-tight text-balance text-ink">
          {title}
          {tail ? (
            <>
              {" "}
              <span className="text-brand-orange">{tail}</span>
            </>
          ) : null}
        </h2>
      </Reveal>
      {text ? (
        <Reveal>
          <p className="max-w-[62ch] text-[15px] leading-relaxed text-muted-foreground sm:text-[17px]">{text}</p>
        </Reveal>
      ) : null}
    </InView>
  );
}
