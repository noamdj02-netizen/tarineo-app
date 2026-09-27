import { ArrowUpRight } from "lucide-react";
import { Reveal } from "@/components/motion/reveal";
import { InView } from "@/components/site/in-view";
import { LandingButton } from "@/components/site/landing-button";
import { FINAL_CTA } from "@/lib/site/tarineo";
import { cn } from "@/lib/utils";

/** CTA final : grand panneau sombre, trame de plan, halo orange discret. */
export function LandingClosingCta({ className }: { className?: string }) {
  return (
    <section className={cn("px-4 pt-6 pb-4 sm:px-8 sm:pb-6", className)}>
      <InView className="relative isolate mx-auto max-w-[1080px] overflow-hidden rounded-[24px] border border-border bg-bg px-6 py-16 text-center shadow-lift sm:rounded-[32px] sm:px-12 sm:py-24">
        {/* Trame de plan technique */}
        <div
          aria-hidden
          className="absolute inset-0 -z-10 bg-[linear-gradient(rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[size:48px_48px] [mask-image:radial-gradient(ellipse_70%_70%_at_50%_50%,black_20%,transparent_80%)]"
        />
        <div
          aria-hidden
          className="absolute bottom-[-45%] left-1/2 -z-10 h-[90%] w-[80%] -translate-x-1/2 animate-[glow-drift_22s_ease-in-out_infinite] rounded-full bg-[radial-gradient(closest-side,rgba(236,88,33,0.28),transparent_72%)] blur-2xl motion-reduce:animate-none"
        />
        <div className="mx-auto flex max-w-[760px] flex-col items-center gap-6">
          <Reveal>
            <p className="mono-label">{`/ ${FINAL_CTA.label} ///`}</p>
          </Reveal>
          <Reveal>
            <h2 className="font-display text-[clamp(32px,6.4vw,64px)] leading-[1.02] font-semibold tracking-tightest text-balance">
              {FINAL_CTA.title} <span className="text-brand-orange">{FINAL_CTA.tail}</span>
            </h2>
          </Reveal>
          <Reveal className="flex w-full max-w-[360px] flex-col items-center gap-3 sm:max-w-none">
            <LandingButton
              href={FINAL_CTA.href}
              variant="orange"
              icon={<ArrowUpRight aria-hidden />}
              fullWidth
              className="min-h-14 px-8 text-[16px] sm:w-auto"
            >
              {FINAL_CTA.cta}
            </LandingButton>
            <p className="text-[15px] sm:text-base text-muted-foreground">{FINAL_CTA.note}</p>
          </Reveal>
        </div>
      </InView>
    </section>
  );
}
