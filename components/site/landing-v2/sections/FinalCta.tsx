"use client";

import { motion, useReducedMotion } from "framer-motion";

import { ArrowRight, Button } from "@/components/site/landing-v2/components/ui/Button";
import { Mascot } from "@/components/site/landing-v2/components/ui/Mascot";
import {
  LANDING_CARD_SHADOW,
  LandingSectionHeading,
  LandingSurface,
} from "@/components/site/landing-v2/components/ui/LandingSurface";
import {
  LANDING_EASE,
  LANDING_VIEW,
  LandingStagger,
  LandingStaggerItem,
} from "@/components/site/landing-v2/lib/landing-motion";
import { LANDING_SIGNUP } from "@/lib/site/landing-v2-auth";
import { cn } from "@/lib/utils";

/** CTA final — même panneau que Parcours. */
export function FinalCtaCard({ className }: { className?: string }) {
  const reduce = useReducedMotion();

  return (
    <LandingSurface
      className={cn(LANDING_CARD_SHADOW, className)}
      contentClassName="grid items-center gap-8 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)] lg:gap-10"
    >
      <LandingStagger className="min-w-0" stagger={0.07}>
        <LandingStaggerItem>
          <LandingSectionHeading
            align="left"
            badge="Commencer"
            title={
              <>
                Vous travaillez sur votre entreprise.
                <br />
                <span className="text-ink-400">Tarinéo travaille dans votre entreprise.</span>
              </>
            }
            subtitle="Importez un premier devis ou une facture fournisseur : la comparaison à vos prix habituels prend quelques minutes — sans journée d’installation ni engagement sur votre logiciel actuel."
            className="max-w-none"
          />
        </LandingStaggerItem>
        <LandingStaggerItem>
          <div className="mt-2 flex flex-wrap items-center gap-3">
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
    </LandingSurface>
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
