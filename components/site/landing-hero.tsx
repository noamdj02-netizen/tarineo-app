"use client";

import { ArrowUpRight, HardHat } from "lucide-react";
import { AnimatedBorderTrail, CycleText } from "@/components/animata";
import { Reveal, RevealGroup, SectionEnter } from "@/components/motion/reveal";
import { HeroMotionStage } from "@/components/site/hero-motion-stage";
import { LandingButton } from "@/components/site/landing-button";
import { HERO } from "@/lib/site/tarineo";

const HERO_CYCLES = [
  "Analysez vos devis.",
  "Détectez les hausses.",
  "Pilotez vos chantiers.",
] as const;

/**
 * Hero parallèle Mosey + touches Animata (cycle texte, bordure trail).
 */
export function LandingHero() {
  return (
    <section
      id="top"
      className="theme-light relative isolate scroll-mt-24 overflow-clip bg-[#FFFFFF] px-4 pt-[112px] pb-10 text-[#0A0A0A] sm:px-8 sm:pt-[120px] sm:pb-14"
    >
      <RevealGroup
        stagger={0.04}
        delay={0.02}
        className="relative mx-auto grid w-full max-w-[1080px] gap-6 sm:gap-8 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)] lg:items-end lg:gap-10"
      >
        <Reveal className="text-left">
          <p className="mb-3 font-display text-[13px] font-semibold tracking-[0.04em] text-[#FF6B1A] uppercase sm:text-[14px]">
            {HERO.badge}
          </p>
          <h1 className="font-display text-[clamp(36px,6.5vw,64px)] leading-[1.02] font-semibold tracking-[-0.035em] text-balance">
            {HERO.title}
            <br />
            <span className="text-[#FF6B1A]">{HERO.titleTail}</span>
          </h1>
          <div className="mt-6 flex flex-col gap-2.5 sm:flex-row sm:items-center sm:gap-3">
            <LandingButton
              href={HERO.primary.href}
              variant="orange"
              icon={<ArrowUpRight aria-hidden strokeWidth={2.25} />}
              className="min-h-11 w-full sm:w-auto"
            >
              {HERO.primary.label}
            </LandingButton>
            <LandingButton
              href={HERO.secondary.href}
              variant="secondary"
              prefetch={false}
              className="min-h-11 w-full border-[rgba(10,10,10,0.08)] bg-transparent text-[#0A0A0A] shadow-none hover:bg-[#F5F5F3] sm:w-auto"
            >
              {HERO.secondary.label}
            </LandingButton>
          </div>
          <p className="mt-4 flex items-center gap-2 text-[13px] text-[#6E6E6E]">
            <HardHat className="size-3.5 shrink-0 text-[#FF6B1A]" strokeWidth={2} aria-hidden />
            {HERO.founderLine}
          </p>
        </Reveal>

        <Reveal className="text-left lg:text-right">
          <p className="max-w-[36ch] text-[15px] leading-[1.55] text-[#6E6E6E] text-pretty lg:ml-auto sm:text-[16px]">
            {HERO.text}
          </p>
          <p className="mt-3 font-display text-[18px] font-semibold tracking-[-0.02em] text-[#0A0A0A] lg:text-right sm:text-[20px]">
            <CycleText words={HERO_CYCLES} className="text-[#FF6B1A]" />
          </p>
        </Reveal>
      </RevealGroup>

      <SectionEnter className="relative mx-auto mt-10 max-w-[1080px] sm:mt-12" delay={0.06}>
        <AnimatedBorderTrail
          trailColor="#FF6B1A"
          trailSize="sm"
          duration="12s"
          contentClassName="bg-[#FFFFFF] p-1 sm:p-2"
        >
          <HeroMotionStage />
        </AnimatedBorderTrail>
      </SectionEnter>
    </section>
  );
}
