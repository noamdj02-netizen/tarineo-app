"use client";

import Image from "next/image";
import { motion, useReducedMotion } from "motion/react";
import { landingSpringSoft } from "./motion/landingMotionConfig";

const STATS = [
  {
    icon: (
      <div className="flex items-center">
        {["/landing/avatar-1.png", "/landing/avatar-2.png", "/landing/avatar-3.png"].map((src, i) => (
          <div
            key={src}
            className="relative -ml-2 h-10 w-10 overflow-hidden rounded-full border-[1.5px] border-white first:ml-0"
            style={{ zIndex: 3 - i }}
          >
            <Image src={src} alt="" fill className="object-cover" sizes="40px" />
          </div>
        ))}
      </div>
    ),
    valeur: "120K+",
    desc: "analyses de devis réalisées",
  },
  {
    icon: <Image src="/landing/star.svg" alt="" width={40} height={40} className="h-10 w-10" />,
    valeur: "4.9",
    desc: "note moyenne des artisans",
  },
  {
    icon: <Image src="/landing/location.svg" alt="" width={40} height={40} className="h-10 w-10" />,
    valeur: "89+",
    desc: "distributeurs compatibles",
  },
];

export function LandingProofStats() {
  const reduce = useReducedMotion();

  return (
    <div className="landing-container grid gap-10 md:grid-cols-3 md:gap-8">
      {STATS.map((s, i) => (
        <motion.div
          key={s.valeur}
          className="max-w-[306px]"
          initial={reduce ? false : { opacity: 0, y: 24 }}
          whileInView={reduce ? undefined : { opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ ...landingSpringSoft, delay: i * 0.08 }}
        >
          <div className="mb-5 flex items-center gap-3">
            {s.icon}
            <p className="landing-display text-[2.5rem] font-semibold leading-none text-[var(--landing-text)]">{s.valeur}</p>
          </div>
          <p className="landing-body text-base leading-normal text-[var(--landing-muted)]">{s.desc}</p>
        </motion.div>
      ))}
    </div>
  );
}
