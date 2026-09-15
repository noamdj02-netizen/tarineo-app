"use client";

import Image from "next/image";
import { motion, useReducedMotion } from "motion/react";
import { landingEase, landingSpring, landingSpringSoft } from "./_components/motion/landingMotionConfig";

function cardEntrance(delay: number, reduce: boolean | null) {
  if (reduce) return {};
  return {
    initial: { opacity: 0, y: 20, scale: 0.94 },
    animate: { opacity: 1, y: 0, scale: 1 },
    transition: { ...landingSpringSoft, delay, ease: landingEase },
  };
}

function HeroAlertPill({ reduce }: { reduce: boolean | null }) {
  return (
    <motion.div
      className="absolute left-0 top-0 z-20 hidden rounded-full border-[1.5px] border-[#e9e9eb] bg-white px-4 py-2.5 shadow-[var(--landing-shadow-card)] sm:flex"
      {...cardEntrance(0.45, reduce)}
    >
      <div className="flex items-center gap-3">
        <span className="landing-gradient-bg flex h-6 w-6 shrink-0 items-center justify-center rounded-full">
          <Image src="/landing/hero-phone/arrow-up.svg" alt="" width={16} height={16} className="h-4 w-4" />
        </span>
        <span className="whitespace-nowrap text-base text-[var(--landing-text)]">3 prix anormaux détectés</span>
      </div>
    </motion.div>
  );
}

function HeroEcartCard({ reduce }: { reduce: boolean | null }) {
  return (
    <motion.div
      className="absolute left-[1.13%] top-[22.3%] z-20 hidden sm:block"
      {...cardEntrance(0.55, reduce)}
    >
      <div className="-rotate-[6deg] rounded-3xl border-[1.5px] border-[#e9e9eb] bg-white p-6 shadow-[var(--landing-shadow-card-lg)]">
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-1.5">
            <span className="text-base text-[var(--landing-muted)]">Écart détecté</span>
            <Image src="/landing/hero-phone/dollar-gray.svg" alt="" width={18} height={18} className="h-[18px] w-[18px]" />
          </div>
          <p className="text-[2rem] font-semibold leading-tight text-[var(--landing-text)]">+18,40 €</p>
          <div className="flex items-center gap-3">
            <span className="landing-gradient-bg h-6 w-6 shrink-0 rounded-full" />
            <span className="text-base text-[var(--landing-text)]">Prix fournisseur</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function HeroEconomieCard({ reduce }: { reduce: boolean | null }) {
  return (
    <motion.div
      className="absolute left-[68.85%] top-[2.5%] z-20 hidden rounded-3xl border-[1.5px] border-[#e9e9eb] bg-white p-6 shadow-[var(--landing-shadow-card)] md:block"
      {...cardEntrance(0.5, reduce)}
    >
      <div className="flex flex-col gap-1.5">
        <div className="flex items-center gap-1.5">
          <span className="text-base text-[var(--landing-text)]/80">Économie potentielle</span>
          <Image src="/landing/hero-phone/dollar-orange.svg" alt="" width={18} height={18} className="h-[18px] w-[18px]" />
        </div>
        <p className="text-[2rem] font-semibold leading-tight text-[var(--landing-text)]">127,50 €</p>
        <p className="landing-gradient-text text-base">↓ sur ce devis</p>
      </div>
    </motion.div>
  );
}

function HeroSocialProof({ reduce }: { reduce: boolean | null }) {
  return (
    <motion.div
      className="absolute left-[59.4%] top-[55.2%] z-20 hidden items-center gap-0.5 rounded-full border border-[#e9e9eb] bg-white py-0.5 pl-0.5 pr-1.5 md:flex"
      {...cardEntrance(0.65, reduce)}
    >
      <div className="flex items-center">
        {[1, 2, 3].map((i, idx) => (
          <div
            key={i}
            className="relative h-10 w-10 overflow-hidden rounded-full border-[1.5px] border-white"
            style={{ marginRight: idx < 2 ? -8 : 0, zIndex: 3 - idx }}
          >
            <Image src={`/landing/avatar-${i}.png`} alt="" fill className="object-cover" sizes="40px" />
          </div>
        ))}
      </div>
      <Image src="/landing/hero-phone/heart.svg" alt="" width={24} height={24} className="mx-0.5 h-6 w-6" />
      <span className="pr-1 text-xl font-medium text-[var(--landing-text)]">12k+</span>
    </motion.div>
  );
}

function HeroActionButton({ reduce }: { reduce: boolean | null }) {
  return (
    <motion.div
      className="absolute left-[84.2%] top-[66.1%] z-20 hidden h-[50px] w-[50px] items-center justify-center rounded-full border-[1.5px] border-[var(--landing-border-popular)] bg-white md:flex"
      {...cardEntrance(0.7, reduce)}
    >
      <Image src="/landing/hero-phone/arrow-action.svg" alt="" width={24} height={24} className="h-6 w-6" />
    </motion.div>
  );
}

export function LandingHeroPhoneComposition() {
  const reduce = useReducedMotion();

  const phoneMotion = reduce
    ? {}
    : {
        initial: { opacity: 0, y: 24, scale: 0.96 },
        animate: { opacity: 1, y: 0, scale: 1 },
        transition: { ...landingSpring, delay: 0.35, ease: landingEase },
      };

  return (
    <div className="relative w-full shrink-0">
      <div className="relative mx-auto w-full min-h-[240px] max-sm:flex max-sm:justify-center max-sm:py-2 sm:min-h-[319px]">
        <HeroAlertPill reduce={reduce} />
        <HeroEcartCard reduce={reduce} />
        <HeroEconomieCard reduce={reduce} />
        <HeroSocialProof reduce={reduce} />
        <HeroActionButton reduce={reduce} />

        <motion.div
          className="relative z-10 w-[min(72vw,378px)] max-w-[378px] sm:absolute sm:bottom-0 sm:left-[23.02%] sm:w-[42.66%]"
          {...phoneMotion}
        >
          <Image
            src="/landing/hero-phone/phone-screen.png"
            alt="Aperçu de l'analyse Tarineo sur mobile — écran Analyse du devis fournisseur"
            width={383}
            height={297}
            className="h-auto w-full"
            priority
            unoptimized
          />
        </motion.div>
      </div>
    </div>
  );
}
