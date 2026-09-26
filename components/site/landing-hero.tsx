"use client";

import { ArrowRight, Check } from "lucide-react";
import { useReducedMotion } from "framer-motion";
import Link from "next/link";
import { Reveal, RevealGroup } from "@/components/motion/reveal";
import { BrandFocus } from "@/components/site/brand-focus";
import { HeroPrompt } from "@/components/site/hero-prompt";
import { LandingButton } from "@/components/site/landing-button";
import { WordsPullUp } from "@/components/site/words-pull-up";
import { BRAND } from "@/lib/brand";
import { PRO_TRIAL_DAYS } from "@/lib/billing/plans";
import { cn } from "@/lib/utils";

const PROOF = [
  `${PRO_TRIAL_DAYS} jours d’essai sans carte`,
  "Prix qui baisse chaque année",
  "Tes données restent à toi",
];

const EASE = [0.16, 1, 0.3, 1] as const;

/** Hero #commencer : cadre film + le bloc fondateur inchangé. */
export function LandingHero() {
  const reduce = useReducedMotion();

  return (
    <div className="relative isolate min-h-dvh w-full overflow-hidden bg-ink">
        {reduce ? (
          <div
            aria-hidden
            className="absolute inset-0 bg-ink"
          />
        ) : (
          <video
            className="absolute inset-0 size-full min-h-dvh object-cover"
            src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260405_170732_8a9ccda6-5cff-4628-b164-059c500a2b41.mp4"
            poster="/videos/launch-poster.jpg"
            autoPlay
            loop
            muted
            playsInline
            preload="metadata"
            aria-hidden
            onError={(e) => {
              e.currentTarget.src = "/videos/launch.mp4";
            }}
          />
        )}
        <div aria-hidden className="noise-overlay opacity-25 mix-blend-overlay" />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 bottom-0 h-[42%] bg-gradient-to-t from-ink/55 to-transparent"
        />

        <RevealGroup
          className={cn(
            "relative z-10 mx-auto flex min-h-dvh w-full max-w-[860px]",
            "flex-col items-center justify-end gap-5 px-5 pt-[5.5rem] pb-[7.5rem] text-center sm:gap-6 sm:px-8 sm:pb-12",
          )}
        >
          <Reveal>
            <p className="mono-label text-accent-ink/70">/ Cockpit fondateur ///</p>
          </Reveal>
          <Reveal>
            <h1 className="font-display text-[clamp(32px,8.2vw,76px)] leading-[1.02] font-semibold tracking-tightest text-balance text-accent-ink">
              <WordsPullUp text="Tous tes projets." />{" "}
              <span className="text-accent-ink/60">
                <WordsPullUp text="Un seul en" delay={0.24} /> <BrandFocus />.
              </span>
            </h1>
          </Reveal>
          <Reveal
            className="max-w-[56ch] text-[16px] leading-relaxed text-accent-ink/70 sm:text-[18px]"
            transition={{ duration: 0.55, delay: 0.5, ease: EASE }}
          >
            <p>{BRAND.description}</p>
          </Reveal>
          <Reveal
            className="flex w-full max-w-[min(100%,360px)] flex-col gap-2.5 sm:max-w-none sm:flex-row sm:flex-wrap sm:justify-center sm:gap-3"
            transition={{ duration: 0.55, delay: 0.7, ease: EASE }}
          >
            <Link
              href="/inscription?plan=pro"
              className="group inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-pill bg-accent-ink py-1.5 pr-1.5 pl-5 text-[15px] font-medium text-ink transition-[gap,transform] duration-300 ease-out-soft hover:gap-3 active:scale-[0.98] sm:w-auto"
            >
              Essai gratuit {PRO_TRIAL_DAYS} jours
              <span className="grid size-9 place-items-center rounded-full bg-ink text-accent-ink transition-transform duration-300 ease-out-soft group-hover:scale-110 sm:size-10">
                <ArrowRight className="size-4" aria-hidden />
              </span>
            </Link>
            <LandingButton
              href="/#solution"
              variant="secondary"
              fullWidth
              className="border-accent-ink/20 bg-ink/30 text-accent-ink shadow-none hover:bg-ink/50 sm:w-auto sm:max-w-none"
            >
              Voir le produit
            </LandingButton>
          </Reveal>
          <Reveal className="mt-1 w-full max-w-[680px]">
            <HeroPrompt onFilm />
          </Reveal>
          <Reveal>
            <ul className="flex flex-col items-center gap-2 text-[13px] text-accent-ink/70 sm:flex-row sm:flex-wrap sm:justify-center sm:gap-x-5 sm:gap-y-2 sm:text-[13.5px]">
              {PROOF.map((p) => (
                <li key={p} className="flex items-center gap-1.5">
                  <Check className="size-3.5 text-st-focus" aria-hidden />
                  {p}
                </li>
              ))}
            </ul>
          </Reveal>
        </RevealGroup>
    </div>
  );
}
