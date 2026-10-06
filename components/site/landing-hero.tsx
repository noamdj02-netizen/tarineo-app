"use client";

import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { Reveal, RevealGroup } from "@/components/motion/reveal";
import { HeroBackdrop } from "@/components/site/hero/hero-backdrop";
import { HeroBenefits } from "@/components/site/hero/hero-benefits";
import { HeroDocumentFlow } from "@/components/site/hero/hero-document-flow";
import { HeroHeadline } from "@/components/site/hero/hero-headline";
import { LandingButton } from "@/components/site/landing-button";
import { HERO, OFFER } from "@/lib/site/tarineo";

/**
 * Hero TARINEO — ivoire éditorial, copie à gauche, transformation à droite.
 */
export function LandingHero() {
  const [eyebrowLead, eyebrowRest] = HERO.badge.split(" · ");

  return (
    <section
      id="top"
      className="relative isolate -mt-[70px] scroll-mt-24 overflow-clip pt-[calc(7.75rem+70px)] pb-10 sm:pt-[calc(8.75rem+70px)] sm:pb-12 lg:pb-10"
    >
      <HeroBackdrop />

      <div className="relative mx-auto grid w-full max-w-[1240px] items-center gap-12 px-4 sm:px-8 lg:grid-cols-[minmax(0,0.44fr)_minmax(0,0.56fr)] lg:gap-16 xl:gap-[4.5rem]">
        <RevealGroup stagger={0.06} delay={0.03} className="flex flex-col lg:pr-2">
          <Reveal>
            <p className="text-[11px] font-semibold tracking-[0.18em] uppercase">
              <span className="text-tarineo-orange">{eyebrowLead}</span>
              {eyebrowRest ? (
                <span className="text-muted-foreground"> · {eyebrowRest}</span>
              ) : null}
            </p>
          </Reveal>

          <Reveal>
            <HeroHeadline lead={HERO.title} highlight={HERO.titleTail} />
          </Reveal>

          <Reveal>
            <p className="mt-6 max-w-prose text-[18px] leading-[1.6] text-muted-foreground text-pretty sm:text-[19px]">
              {HERO.text}
            </p>
          </Reveal>

          <Reveal>
            <div className="mt-8 flex flex-col gap-3">
              <LandingButton
                href={HERO.primary.href}
                variant="orange"
                icon={<ArrowRight aria-hidden strokeWidth={2} />}
                className="min-h-14 w-full rounded-full shadow-landing-cta hover:-translate-y-0.5 sm:w-fit sm:min-w-[280px]"
              >
                {HERO.primary.label}
              </LandingButton>
              <p className="text-[14px] leading-relaxed text-muted-foreground">
                {OFFER}.{" "}
                <Link
                  href={HERO.secondary.href}
                  className="font-medium text-ink underline decoration-line underline-offset-4 transition-colors hover:text-tarineo-orange"
                >
                  {HERO.secondary.label}
                </Link>
              </p>
              <p className="text-[13px] leading-relaxed text-landing-ink-muted">{HERO.founderLine}</p>
            </div>
          </Reveal>
        </RevealGroup>

        <HeroDocumentFlow className="min-w-0 lg:pt-1" />
      </div>

      <HeroBenefits />
    </section>
  );
}
