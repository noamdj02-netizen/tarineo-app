import { ArrowUpRight } from "lucide-react";
import { Reveal } from "@/components/motion/reveal";
import { LandingButton } from "@/components/site/landing-button";
import { TarineoMark } from "@/components/site/tarineo-mark";
import { FINAL_CTA } from "@/lib/site/tarineo";
import { cn } from "@/lib/utils";

/** CTA final — panneau sombre plein, typo display, un seul geste. */
export function LandingClosingCta({ className }: { className?: string }) {
  return (
    <section className={cn("theme-light px-4 pt-8 pb-6 sm:px-8 sm:pb-10", className)}>
      <div className="relative isolate mx-auto max-w-[1080px] overflow-hidden rounded-[28px] bg-[#0A0A0A] px-6 py-20 text-center sm:rounded-[32px] sm:px-12 sm:py-28">
        <div className="mx-auto flex max-w-[560px] flex-col items-center gap-6 sm:gap-8">
          <Reveal>
            <TarineoMark className="size-12 sm:size-14" priority={false} />
          </Reveal>
          <Reveal>
            <h2 className="font-display text-[clamp(32px,6vw,52px)] leading-[1.04] font-semibold tracking-[-0.03em] text-balance text-white">
              {FINAL_CTA.title}
              <br />
              <span className="text-[#FF6B1A]">{FINAL_CTA.tail}</span>
            </h2>
          </Reveal>
          {"text" in FINAL_CTA && FINAL_CTA.text ? (
            <Reveal>
              <p className="max-w-[36ch] text-[16px] leading-[1.5] text-white/65 text-pretty sm:text-[17px]">
                {FINAL_CTA.text}
              </p>
            </Reveal>
          ) : null}
          <Reveal>
            <LandingButton
              href={FINAL_CTA.href}
              variant="orange"
              icon={<ArrowUpRight aria-hidden />}
              className="min-h-12 px-8 text-[15px]"
            >
              {FINAL_CTA.cta}
            </LandingButton>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
