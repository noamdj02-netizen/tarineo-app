"use client";

import Image from "next/image";
import { motion, useReducedMotion } from "motion/react";
import { landingSpringSoft } from "./motion/landingMotionConfig";

const DEVIS = [
  { logo: "/landing/pointp.png", nom: "Point P", desc: "Devis matériel sanitaire", prix: "890 €" },
  { logo: "/landing/cedeo.png", nom: "Cedeo", desc: "Devis plomberie", prix: "1 240 €" },
  { logo: "/landing/rexel.png", nom: "Rexel", desc: "Devis matériel électrique", prix: "2 150 €" },
];

export function LandingFeaturesMockup() {
  const reduce = useReducedMotion();

  return (
    <motion.div
      className="w-full max-w-[568px] shrink-0 rounded-[20px] bg-[var(--landing-surface)] p-10"
      initial={reduce ? false : { opacity: 0, x: -32, scale: 0.97 }}
      whileInView={reduce ? undefined : { opacity: 1, x: 0, scale: 1 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={landingSpringSoft}
    >
      <div className="flex flex-col gap-4">
        {DEVIS.map((d, i) => (
          <motion.div
            key={d.nom}
            className="flex h-24 items-center justify-between rounded-3xl bg-white px-[22px] py-[22px] shadow-[0_2px_12px_rgba(0,0,0,0.04)]"
            initial={reduce ? false : { opacity: 0, y: 20 }}
            whileInView={reduce ? undefined : { opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ ...landingSpringSoft, delay: i * 0.1 }}
            whileHover={reduce ? undefined : { y: -4, scale: 1.01, transition: { duration: 0.2 } }}
          >
            <div className="flex items-center gap-4">
              <div className="relative h-[52px] w-[52px] shrink-0 overflow-hidden rounded-xl">
                <Image src={d.logo} alt="" fill className="object-cover" sizes="52px" />
              </div>
              <div>
                <p className="landing-display text-lg font-semibold text-[var(--landing-text)]">{d.nom}</p>
                <p className="landing-body text-sm text-[var(--landing-muted)]">{d.desc}</p>
              </div>
            </div>
            <p className="landing-display text-lg font-semibold text-[var(--landing-text)]">{d.prix}</p>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
