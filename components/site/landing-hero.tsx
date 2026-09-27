"use client";

import { ArrowRight, Check } from "lucide-react";
import { useReducedMotion } from "framer-motion";
import Link from "next/link";
import { useState } from "react";
import { Reveal, RevealGroup } from "@/components/motion/reveal";
import { BrandFocus } from "@/components/site/brand-focus";
import { HeroPrompt } from "@/components/site/hero-prompt";
import { LandingButton } from "@/components/site/landing-button";
import { WordsPullUp } from "@/components/site/words-pull-up";
import { BRAND } from "@/lib/brand";
import { PRO_TRIAL_DAYS } from "@/lib/billing/plans";
import { cn } from "@/lib/utils";

const HERO_FILM =
  "https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260405_170732_8a9ccda6-5cff-4628-b164-059c500a2b41.mp4";
const HERO_POSTER = "/videos/hero-poster.jpg";

const PROOF = [
  `${PRO_TRIAL_DAYS} jours d’essai sans carte`,
  "Prix qui baisse chaque année",
  "Tes données restent à toi",
];

const EASE = [0.16, 1, 0.3, 1] as const;

/** Paysage du film. Cadré pour laisser le fondateur visible au centre. */
function HeroBackdrop({ reduce }: { reduce: boolean }) {
  const [failed, setFailed] = useState(false);
  const mediaClass = "absolute inset-0 size-full object-cover object-[center_52%] sm:object-[center_48%]";

  return (
    <>
      <img
        src={HERO_POSTER}
        alt=""
        aria-hidden
        fetchPriority="high"
        className={mediaClass}
      />
      {!reduce && !failed ? (
        <video
          className={mediaClass}
          src={HERO_FILM}
          poster={HERO_POSTER}
          autoPlay
          loop
          muted
          playsInline
          preload="metadata"
          aria-hidden
          onError={() => setFailed(true)}
        />
      ) : null}
    </>
  );
}

/** Hero #commencer : titre en haut, bonhomme au milieu, CTA en bas. */
export function LandingHero() {
  const reduce = useReducedMotion();

  return (
    <div className="relative isolate flex min-h-lvh min-h-[-webkit-fill-available] w-full flex-col overflow-hidden bg-ink">
        <HeroBackdrop reduce={!!reduce} />
        <div aria-hidden className="noise-overlay opacity-25 mix-blend-overlay" />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-0 h-[42%] bg-gradient-to-b from-ink/60 via-ink/25 to-transparent"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 bottom-0 h-[28%] bg-gradient-to-t from-ink/65 via-ink/25 to-transparent"
        />

        <RevealGroup
          className={cn(
            "relative z-10 mx-auto flex w-full max-w-[860px] flex-1 flex-col",
            "items-center justify-between gap-5 px-4",
            "pt-[max(5.25rem,calc(env(safe-area-inset-top)+3.75rem))]",
            "pb-[max(1.75rem,env(safe-area-inset-bottom))]",
            "text-center sm:gap-6 sm:px-8 sm:pb-12",
          )}
        >
          {/* Titre + CTA en haut : le milieu du film reste libre pour le fondateur. */}
          <div className="flex w-full flex-col items-center gap-3 sm:gap-4">
            <Reveal>
              <p className="mono-label text-accent-ink/70">/ Cockpit fondateur ///</p>
            </Reveal>
            <Reveal>
              <h1 className="font-display text-[clamp(32px,8.6vw,72px)] leading-[1.02] font-semibold tracking-tightest text-balance text-accent-ink">
                <span className="block">
                  <WordsPullUp text="Construis ton SaaS." />
                </span>
                <span className="mt-0.5 block">
                  <BrandFocus className="inline-block">
                    <WordsPullUp text="Lance-le." delay={0.2} />
                  </BrandFocus>
                </span>
                <span className="mt-1.5 block text-[0.72em] font-semibold tracking-tightest text-accent-ink/70 sm:mt-2 sm:text-[0.62em]">
                  <WordsPullUp text="Ne te disperse plus." delay={0.4} />
                </span>
              </h1>
            </Reveal>
            <Reveal
              className="max-w-[38ch] text-[15px] leading-snug text-pretty text-accent-ink/70 sm:max-w-[52ch] sm:text-[17px] sm:leading-relaxed"
              transition={{ duration: 0.55, delay: 0.55, ease: EASE }}
            >
              <p>{BRAND.description}</p>
            </Reveal>
            <Reveal
              className="mt-1 flex w-full max-w-[min(100%,360px)] flex-col gap-2 sm:mt-2 sm:max-w-none sm:flex-row sm:flex-wrap sm:justify-center sm:gap-3"
              transition={{ duration: 0.55, delay: 0.7, ease: EASE }}
            >
              <Link
                href="/inscription?plan=pro"
                className="group inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-pill bg-accent-ink py-1.5 pr-1.5 pl-5 text-[15px] font-medium text-ink shadow-lift transition-[gap,transform,box-shadow] duration-300 ease-out-soft hover:-translate-y-0.5 hover:gap-3 active:translate-y-0 active:scale-[0.98] sm:min-h-12 sm:w-auto"
              >
                Essai gratuit {PRO_TRIAL_DAYS} jours
                <span className="grid size-8 place-items-center rounded-full bg-ink text-accent-ink shadow-dark transition-transform duration-300 ease-out-soft group-hover:scale-110 sm:size-10">
                  <ArrowRight className="size-4" aria-hidden />
                </span>
              </Link>
              <LandingButton
                href="/#solution"
                variant="secondary"
                fullWidth
                className="min-h-11 border-accent-ink/20 bg-ink/30 text-accent-ink shadow-none hover:bg-ink/50 sm:min-h-12 sm:w-auto sm:max-w-none"
              >
                Voir le produit
              </LandingButton>
            </Reveal>
          </div>

          <div className="flex w-full flex-col items-center gap-2.5 sm:gap-3">
            <Reveal className="w-full max-w-[680px]">
              <HeroPrompt onFilm />
            </Reveal>
            <Reveal className="w-full">
              <ul className="flex flex-wrap items-center justify-center gap-x-2 gap-y-1 text-[11px] leading-tight tracking-tight text-accent-ink/70 sm:gap-x-5 sm:gap-y-2 sm:text-[13.5px] sm:tracking-normal">
                {PROOF.map((p) => (
                  <li key={p} className="flex items-center gap-1 whitespace-nowrap">
                    <Check className="size-3.5 shrink-0 text-st-focus" aria-hidden />
                    {p}
                  </li>
                ))}
              </ul>
            </Reveal>
          </div>
        </RevealGroup>
    </div>
  );
}
