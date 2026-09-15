"use client";

import Image from "next/image";
import Link from "next/link";
import { motion, useReducedMotion } from "motion/react";
import { landingEase, landingSpringSoft } from "./motion/landingMotionConfig";

interface Props {
  ctaHref: string;
  ctaLabel: string;
}

export function LandingHeroIntro({ ctaHref, ctaLabel }: Props) {
  const reduce = useReducedMotion();

  const item = (delay: number) =>
    reduce
      ? {}
      : {
          initial: { opacity: 0, y: 28 },
          animate: { opacity: 1, y: 0 },
          transition: { ...landingSpringSoft, delay, ease: landingEase },
        };

  return (
    <div className="mx-auto flex max-w-[764px] flex-col items-center gap-12 pt-8 text-center sm:gap-16 sm:pt-12">
      <div className="flex flex-col items-center gap-3 sm:gap-4">
        <motion.div
          className="inline-flex items-center gap-2 rounded-full bg-[var(--landing-badge-bg)] py-1 pl-1 pr-3"
          {...item(0.05)}
        >
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white">
            <Image src="/landing/shield.svg" alt="" width={20} height={20} className="h-5 w-5" />
          </span>
          <span className="landing-display text-base font-medium text-[var(--landing-text)]">
            Pour tous les artisans du bâtiment
          </span>
        </motion.div>

        <div className="flex flex-col gap-4">
          <motion.h1
            className="landing-display text-[2rem] font-bold leading-[1.24] text-white sm:text-[3.375rem]"
            {...item(0.12)}
          >
            Savez-vous si votre{" "}
            <span className="whitespace-nowrap">devis fournisseur</span>
            <br className="hidden sm:block" />
            {" est vraiment au bon prix ?"}
          </motion.h1>
          <motion.p
            className="landing-body mx-auto max-w-[558px] text-base leading-normal text-white"
            {...item(0.2)}
          >
            Tarineo compare chaque devis à votre historique d&apos;achats et détecte les hausses de prix en 10
            secondes. Compatible avec Cedeo, Point P, Rexel et 30+ distributeurs.
          </motion.p>
        </div>
      </div>

      <motion.div
        className="flex flex-wrap items-center justify-center gap-4"
        {...item(0.28)}
      >
        <Link
          href="/#comment-ca-marche"
          className="landing-display rounded-full bg-white px-8 py-3.5 text-base font-medium text-black shadow-[var(--landing-shadow-btn)] transition-transform hover:opacity-90 active:scale-[0.98]"
        >
          Démo
        </Link>
        <Link
          href={ctaHref}
          className="landing-display rounded-full bg-white px-8 py-3.5 text-base font-medium text-black shadow-[var(--landing-shadow-btn)] transition-transform hover:opacity-90 active:scale-[0.98]"
        >
          {ctaLabel} →
        </Link>
      </motion.div>
    </div>
  );
}
