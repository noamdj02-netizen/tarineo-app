import { ArrowUpRight } from "lucide-react";
import { Reveal } from "@/components/motion/reveal";
import { LandingBezel } from "@/components/site/landing-bezel";
import { LandingButton } from "@/components/site/landing-button";
import { FINAL_CTA } from "@/lib/site/tarineo";
import { cn } from "@/lib/utils";

export function LandingClosingCta({ className }: { className?: string }) {
  return (
    <section className={cn("px-4 pb-14 pt-6 sm:px-8 sm:pb-20", className)}>
      <div className="mx-auto max-w-[1180px]">
        <LandingBezel tone="dark" className="bg-[rgba(10,10,10,0.06)]">
          <div className="flex flex-col items-start justify-between gap-10 px-6 py-14 sm:flex-row sm:items-center sm:px-10 sm:py-16 lg:px-14">
            <Reveal>
              <h2 className="max-w-[16ch] font-display text-[clamp(28px,4.2vw,40px)] leading-[1.06] font-semibold tracking-[-0.034em] text-balance text-white">
                {FINAL_CTA.title}{" "}
                <span className="font-serif italic font-normal tracking-[-0.02em] text-white/95">
                  {FINAL_CTA.tail}
                </span>
              </h2>
            </Reveal>
            <Reveal>
              <LandingButton
                href={FINAL_CTA.href}
                variant="orange"
                icon={<ArrowUpRight aria-hidden strokeWidth={2} />}
                className="min-h-[3.25rem] shrink-0 px-2"
              >
                {FINAL_CTA.cta}
              </LandingButton>
            </Reveal>
          </div>
        </LandingBezel>
      </div>
    </section>
  );
}
