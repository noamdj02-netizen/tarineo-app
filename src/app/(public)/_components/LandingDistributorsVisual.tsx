"use client";

import Image from "next/image";
import { motion, useReducedMotion } from "motion/react";
import { LandingDistributorsCard } from "./LandingDistributorsCard";
import { LandingFloat } from "./motion/LandingFloat";
import { landingSpringSoft } from "./motion/landingMotionConfig";

const MAP_W = 633;
const MAP_H = 487;

export function LandingDistributorsVisual() {
  const reduce = useReducedMotion();

  return (
    <motion.div
      className="relative w-full max-w-[633px]"
      initial={reduce ? false : { opacity: 0, scale: 0.95 }}
      whileInView={reduce ? undefined : { opacity: 1, scale: 1 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={landingSpringSoft}
    >
      <LandingFloat y={10} delay={0.5} className="hidden sm:block">
        <Image
          src="/landing/distributors-visual.png"
          alt="Carte Europe avec analyse de devis — compatible Cedeo, Point P, Rexel"
          width={MAP_W}
          height={MAP_H}
          className="h-auto w-full"
        />
      </LandingFloat>

      <div className="sm:hidden">
        <Image
          src="/landing/world-map.png"
          alt=""
          width={MAP_W}
          height={MAP_H}
          className="mb-6 h-auto w-full"
        />
        <LandingDistributorsCard className="mx-auto" />
      </div>
    </motion.div>
  );
}
