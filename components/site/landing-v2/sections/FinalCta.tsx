"use client";

import { motion, useReducedMotion } from "framer-motion";

import { ArrowRight, Button } from "@/components/site/landing-v2/components/ui/Button";
import { Mascot } from "@/components/site/landing-v2/components/ui/Mascot";
import { SectionLabel } from "@/components/site/landing-v2/components/ui/SectionLabel";
import { LANDING_SIGNUP } from "@/lib/site/landing-v2-auth";
import {
  LANDING_EASE,
  LANDING_VIEW,
  LandingCtaGlow,
  LandingFloatCard,
  LandingStagger,
  LandingStaggerItem,
} from "@/components/site/landing-v2/lib/landing-motion";

export function FinalCta() {
  const reduce = useReducedMotion();

  return (
    <section id="contact" className="pb-20 sm:pb-28">
      <div className="shell">
        <LandingFloatCard className="relative surface overflow-hidden shadow-card">
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
                  Connectez votre boîte mail et vos documents. La première analyse de devis prend
                  quelques minutes — pas une journée d&apos;installation.
                </p>
              </LandingStaggerItem>
              <LandingStaggerItem>
                <div className="mt-8 flex flex-wrap items-center gap-3">
                  <motion.div whileHover={reduce ? undefined : { y: -2 }} whileTap={reduce ? undefined : { scale: 0.97 }}>
                    <Button href={LANDING_SIGNUP} size="lg" className="w-full justify-center sm:w-auto">
                      Commencer avec Tarinéo
                      <ArrowRight />
                    </Button>
                  </motion.div>
                  <motion.div whileHover={reduce ? undefined : { y: -2 }} whileTap={reduce ? undefined : { scale: 0.97 }}>
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
      </div>
    </section>
  );
}
