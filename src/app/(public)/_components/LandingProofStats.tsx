"use client";

import Image from "next/image";
import { motion, useReducedMotion } from "motion/react";
import { landingSpringSoft } from "./motion/landingMotionConfig";

const STATS = [
  {
    icon: <Image src="/landing/shield.svg" alt="" width={40} height={40} className="h-10 w-10" />,
    valeur: "< 10 s",
    desc: "pour analyser un devis fournisseur",
  },
  {
    icon: <Image src="/landing/star.svg" alt="" width={40} height={40} className="h-10 w-10" />,
    valeur: "30+",
    desc: "enseignes reconnues (Cedeo, Point P, Rexel…)",
  },
  {
    icon: <Image src="/landing/location.svg" alt="" width={40} height={40} className="h-10 w-10" />,
    valeur: "100 %",
    desc: "basé sur votre historique personnel — jamais un comparateur public",
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
