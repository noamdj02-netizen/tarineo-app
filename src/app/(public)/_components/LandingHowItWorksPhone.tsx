"use client";

import Image from "next/image";
import { motion, useReducedMotion } from "motion/react";
import { LandingFloat } from "./motion/LandingFloat";
import { landingSpringSoft } from "./motion/landingMotionConfig";

export function LandingHowItWorksPhone() {
  const reduce = useReducedMotion();

  return (
    <motion.div
      className="relative w-full max-w-[508px] shrink-0"
      initial={reduce ? false : { opacity: 0, x: 40, scale: 0.96 }}
      whileInView={reduce ? undefined : { opacity: 1, x: 0, scale: 1 }}
      viewport={{ once: true, amount: 0.25 }}
      transition={landingSpringSoft}
    >
      <LandingFloat y={14} delay={0.4}>
        <Image
          src="/landing/how-it-works-phone.png"
          alt="Aperçu de l'application Tarineo — tableau de bord avec économies et fournisseurs"
          width={508}
          height={753}
          className="h-auto w-full drop-shadow-[0_24px_48px_rgba(0,0,0,0.12)]"
        />
      </LandingFloat>
    </motion.div>
  );
}
