"use client";

import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useState } from "react";
import { LandingReveal } from "./_components/motion/LandingReveal";
import { landingSpringSoft } from "./_components/motion/landingMotionConfig";

const FAQ = [
  {
    q: "Puis-je utiliser Tarineo pour plusieurs chantiers ?",
    a: "Oui, vous pouvez suivre les devis de tous vos chantiers depuis un seul compte, avec un historique complet par fournisseur.",
  },
  {
    q: "Quels distributeurs sont compatibles ?",
    a: "Cedeo, Point P, Rexel, Brossette, Richardson, Aubade et plus de 30 enseignes. Photo, PDF ou mail : Tarineo lit le format de vos devis.",
  },
  {
    q: "Comment mettre à jour mes informations ?",
    a: "Depuis Mon entreprise dans votre espace : logo, SIRET, marge par défaut et coordonnées. Modifiable à tout moment.",
  },
  {
    q: "Y a-t-il des avantages pour les gros volumes de devis ?",
    a: "Le plan Équipe couvre jusqu'à 1000 documents par mois. Pour des volumes supérieurs, contactez-nous pour une offre sur mesure.",
  },
  {
    q: "Puis-je accéder à mon compte depuis plusieurs appareils ?",
    a: "Oui. Votre compte est accessible depuis ordinateur, tablette et téléphone avec la même session sécurisée.",
  },
];

export function LandingFaqSection() {
  const [ouvert, setOuvert] = useState(0);
  const reduce = useReducedMotion();

  return (
    <section id="contact" className="scroll-mt-28 bg-white py-16 sm:py-24">
      <div className="landing-container flex flex-col gap-12 lg:flex-row lg:justify-between">
        <LandingReveal variant="left" className="max-w-[331px] shrink-0">
          <p className="landing-body mb-4 text-base text-[var(--landing-muted)]">FAQ</p>
          <h2 className="landing-display mb-10 text-4xl font-bold leading-[1.24] text-[var(--landing-text)] sm:text-[3.375rem]">
            Questions fréquentes
          </h2>
          <p className="landing-body mb-2 text-base font-medium text-[var(--landing-muted)]">Une question ?</p>
          <a href="mailto:contact@tarineo.com" className="landing-gradient-text landing-display text-[2rem] font-medium">
            contact@tarineo.com
          </a>
        </LandingReveal>

        <LandingReveal variant="right" delay={100} className="w-full max-w-[730px]">
          {FAQ.map((item, i) => {
            const estOuvert = ouvert === i;
            return (
              <div
                key={item.q}
                className={`border-black/[0.12] px-5 ${i === 0 ? "border-y-[1.5px] py-8" : "border-b-[1.5px] py-8"}`}
              >
                <button
                  type="button"
                  onClick={() => setOuvert(estOuvert ? -1 : i)}
                  className="flex w-full items-start justify-between gap-4 text-left"
                  aria-expanded={estOuvert}
                >
                  <span className="landing-display text-xl font-semibold text-[var(--landing-text)] sm:text-2xl">{item.q}</span>
                  <span className="landing-display mt-1 shrink-0 text-2xl leading-none text-[var(--landing-text)]" aria-hidden="true">
                    {estOuvert ? "−" : "+"}
                  </span>
                </button>
                <AnimatePresence initial={false}>
                  {estOuvert && (
                    <motion.p
                      key="answer"
                      className="landing-body mt-5 max-w-[575px] text-base leading-normal text-[var(--landing-muted)]"
                      initial={reduce ? false : { opacity: 0, height: 0 }}
                      animate={reduce ? undefined : { opacity: 1, height: "auto" }}
                      exit={reduce ? undefined : { opacity: 0, height: 0 }}
                      transition={landingSpringSoft}
                    >
                      {item.a}
                    </motion.p>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </LandingReveal>
      </div>
    </section>
  );
}
