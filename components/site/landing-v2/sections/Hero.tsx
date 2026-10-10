"use client";

import Link from "next/link";

import { ArrowRight } from "@/components/site/landing-v2/components/ui/Button";
import { HeroScanScene } from "@/components/site/landing-v2/components/ui/HeroScanScene";
import { LandingFlipCta } from "@/components/site/landing-v2/components/ui/LandingFlipCta";
import {
  LandingHeroStagger,
  LandingStaggerItem,
} from "@/components/site/landing-v2/lib/landing-motion";
import { LANDING_SIGNUP } from "@/lib/site/landing-v2-auth";
import { HERO } from "@/lib/site/tarineo";

/**
 * Hero — copy à gauche, animation Figma 160:2 à droite (sans fond / carte).
 * Desktop ≥1024 : 2 colonnes égales, gap 64px, items-center.
 */
export function Hero() {
  return (
    <section id="top" className="relative overflow-x-clip pt-28 pb-12 sm:pt-32 sm:pb-16 lg:pt-36 lg:pb-20">
      <div className="pointer-events-none absolute inset-0" aria-hidden>
        <div className="landing-grain absolute inset-0 opacity-40" />
      </div>

      <div className="shell relative">
        <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
          <LandingHeroStagger className="relative z-10 max-w-xl text-left lg:max-w-none" stagger={0.1}>
            <LandingStaggerItem>
              <Link
                href="/#parcours"
                className="inline-flex items-center gap-2 rounded-full border border-line bg-paper-0/90 py-1.5 pe-3 ps-2 text-[12px] font-semibold tracking-[0.02em] text-ink-600 shadow-sm transition-colors hover:border-line-strong hover:text-ink-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40"
              >
                <span className="h-4 w-1 rounded-full bg-accent" aria-hidden />
                Pensé pour les artisans du BTP
                <ArrowRight className="h-3.5 w-3.5 text-ink-400" />
              </Link>
            </LandingStaggerItem>

            <LandingStaggerItem>
              <h1 className="mt-6 text-[clamp(2.1rem,4.2vw,3.35rem)] font-semibold leading-[1.08] tracking-[-0.035em] text-ink-900">
                {HERO.title}
                <br />
                <span className="hero-title-mark">{HERO.titleTail}</span>
              </h1>
            </LandingStaggerItem>

            <LandingStaggerItem>
              <p className="mt-5 max-w-md text-pretty text-base leading-relaxed text-ink-500 sm:text-lg">
                Déposez des devis désordonnés — TARINEO les lit, structure et livre les données
                en quelques secondes.
              </p>
            </LandingStaggerItem>

            <LandingStaggerItem>
              <div className="mt-8 flex flex-wrap items-center gap-3">
                <LandingFlipCta
                  href={LANDING_SIGNUP}
                  label="Découvrir Tarinéo"
                  variant="primary"
                  size="lg"
                  withArrow
                  className="min-h-11 rounded-xl pe-5 shadow-sm"
                />
                <LandingFlipCta
                  href={HERO.secondary.href}
                  label="Voir une démo"
                  variant="secondary"
                  size="lg"
                  className="min-h-11 rounded-xl bg-paper-0"
                />
              </div>
              <p className="mt-3 text-sm text-ink-400">{HERO.founderLine}</p>
            </LandingStaggerItem>
          </LandingHeroStagger>

          <div className="relative z-0 flex w-full items-center justify-center overflow-visible px-4 lg:justify-end lg:px-0">
            <HeroScanScene />
          </div>
        </div>
      </div>
    </section>
  );
}
