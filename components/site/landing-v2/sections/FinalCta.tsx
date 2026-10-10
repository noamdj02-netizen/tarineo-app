"use client";

import { motion, useReducedMotion } from "framer-motion";

import { ArrowRight, Button } from "@/components/site/landing-v2/components/ui/Button";
import { Mascot } from "@/components/site/landing-v2/components/ui/Mascot";
import { SectionLabel } from "@/components/site/landing-v2/components/ui/SectionLabel";
import {
  LANDING_EASE,
  LANDING_VIEW,
  LandingCtaGlow,
  LandingFloatCard,
  LandingStagger,
  LandingStaggerItem,
} from "@/components/site/landing-v2/lib/landing-motion";
import { LANDING_SIGNUP } from "@/lib/site/landing-v2-auth";
import { cn } from "@/lib/utils";

/** CTA final — copy + mascotte (bonhomme), comme avant Launch UI. */
export function FinalCtaCard({ className }: { className?: string }) {
  const reduce = useReducedMotion();

  return (
    <LandingFloatCard className={cn("relative surface overflow-hidden shadow-card", className)}>
      <LandingCtaGlow />
      <div className="relative grid items-center gap-8 p-7 sm:p-10 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)] lg:gap-6 lg:p-12">
        <LandingStagger className="min-w-0" stagger={0.07}>
          <LandingStaggerItem>
            <SectionLabel className="eyebrow-accent">Commencer</SectionLabel>
          </LandingStaggerItem>
          <LandingStaggerItem>
            <h2 className="mt-4 text-title font-semibold text-ink-900">
              Vous travaillez sur votre entreprise.
              <br />
              <span className="text-ink-400">Tarinéo travaille dans votre entreprise.</span>
            </h2>
          </LandingStaggerItem>
          <LandingStaggerItem>
            <p className="mt-5 max-w-lg text-body-lg text-ink-600">
              Importez un premier devis ou une facture fournisseur : la comparaison à vos prix
              habituels prend quelques minutes — sans journée d&apos;installation ni engagement
              sur votre logiciel actuel.
            </p>
          </LandingStaggerItem>
          <LandingStaggerItem>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <motion.div
                whileHover={reduce ? undefined : { y: -2 }}
                whileTap={reduce ? undefined : { scale: 0.97 }}
              >
                <Button href={LANDING_SIGNUP} size="lg" className="w-full justify-center sm:w-auto">
                  Commencer avec Tarinéo
                  <ArrowRight />
                </Button>
              </motion.div>
              <motion.div
                whileHover={reduce ? undefined : { y: -2 }}
                whileTap={reduce ? undefined : { scale: 0.97 }}
              >
                <Button
                  href="mailto:contact@tarineo.com"
                  variant="secondary"
                  size="lg"
                  className="w-full justify-center sm:w-auto"
                >
                  Poser une question
                </Button>
              </motion.div>
            </div>
          </LandingStaggerItem>
        </LandingStagger>

        <motion.div
          className="flex justify-center lg:justify-end"
          initial={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.96, y: 12 }}
          whileInView={reduce ? { opacity: 1 } : { opacity: 1, scale: 1, y: 0 }}
          viewport={LANDING_VIEW}
          transition={{ duration: 0.55, ease: LANDING_EASE, delay: 0.15 }}
        >
          <Mascot
            name="equipe"
            widthClass="w-[240px] sm:w-[300px] lg:w-[340px]"
            alt="Les mascottes Tarinéo réunies"
            className="max-w-full"
          />
        </motion.div>
      </div>
    </LandingFloatCard>
  );
}

export function FinalCta() {
  return (
    <section id="contact" className="pb-20 sm:pb-28">
      <div className="shell">
        <FinalCtaCard />
      </div>
    </section>
  );
}
