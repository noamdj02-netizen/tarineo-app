"use client";

import Image from "next/image";
import { useReducedMotion } from "framer-motion";

import { cn } from "@/lib/utils";

/** Figma 160:2 — WebP animé détouré (alpha), recadré sur le sujet. */
const ANIM_SRC = "/illustrations/landing-hero-scan/hero-design.webp";
const POSTER_SRC = "/illustrations/landing-hero-scan/scene-poster.png";

/**
 * Animation hero sans plaque blanche : WebP alpha.
 * Affichage agrandi dans la colonne (sujet plus proche).
 */
export function HeroScanScene({ className = "" }: { className?: string }) {
  const reduce = useReducedMotion();

  return (
    <div
      className={cn(
        "relative mx-auto bg-transparent",
        /* Plus gros / plus proche : déborde légèrement la colonne */
        "w-full max-w-[34rem] sm:max-w-[40rem] lg:max-w-none lg:w-[118%] lg:-me-8 xl:w-[122%] xl:-me-12",
        "aspect-[992/640]",
        className,
      )}
      data-node-id="160:2"
      data-name="Hero Design"
    >
      {reduce ? (
        <Image
          src={POSTER_SRC}
          alt="De fichiers bruts aux devis, factures et bons de commande structurés automatiquement"
          fill
          className="bg-transparent object-contain object-center"
          sizes="(max-width: 1024px) 96vw, 55vw"
          priority
          quality={90}
        />
      ) : (
        <img
          src={ANIM_SRC}
          alt="De fichiers bruts aux devis, factures et bons de commande structurés automatiquement"
          className="absolute inset-0 size-full bg-transparent object-contain object-center"
          width={992}
          height={640}
          decoding="async"
          fetchPriority="high"
        />
      )}
    </div>
  );
}
