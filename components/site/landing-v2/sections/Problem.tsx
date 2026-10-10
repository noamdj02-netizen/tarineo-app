"use client";

import { motion, useReducedMotion } from "framer-motion";

import { Icon } from "@/components/site/landing-v2/components/ui/Icon";
import { Mascot } from "@/components/site/landing-v2/components/ui/Mascot";
import { SectionHeading } from "@/components/site/landing-v2/components/ui/SectionLabel";
import {
  LANDING_EASE,
  LANDING_VIEW,
  LandingFlowLines,
  LandingIconPop,
  LandingReveal,
  LandingStagger,
  LandingStaggerItem,
} from "@/components/site/landing-v2/lib/landing-motion";
import { ProblemDocumentPath } from "@/components/site/landing-v2/components/ui/ProblemDocumentPath";
import { MarginProtectionScene } from "@/components/site/landing-v2/components/ui/scenes/MarginProtectionScene";
import { looseDocuments, problemOutputs } from "@/lib/site/landing-v2-content";

export function Problem() {
  const reduce = useReducedMotion();

  return (
    <section id="probleme" className="pt-14 pb-20 sm:pt-16 sm:pb-28">
      <div className="shell">
        <SectionHeading
          label="Le problème"
          title={
            <>
              Votre entreprise possède déjà toutes les informations.
              <span className="mt-2 block text-ink-400">Elles sont simplement dispersées.</span>
            </>
          }
          subtitle="Un devis dans une boîte mail, un prix dans un PDF fournisseur, une relance dans un carnet. Tarinéo rassemble tout au même endroit — puis s'en sert."
        />

        <div className="mt-14">
          <ProblemDocumentPath documents={looseDocuments} />

          <div className="mt-2 hidden sm:block">
            <LandingFlowLines />
          </div>

          <div className="mt-4 grid items-center gap-6 lg:grid-cols-[minmax(0,1fr)_auto]">
            <LandingReveal>
              <div className="surface flex items-center gap-5 p-6">
                <span className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-md bg-accent-soft text-accent-700">
                  <Icon name="spark" className="h-5 w-5" />
                </span>
                <div>
                  <p className="text-[0.9375rem] font-medium text-ink-900">
                    Tarinéo lit vos devis et retient vos prix habituels.
                  </p>
                  <p className="mt-1 text-sm text-ink-400">
                    Chaque ligne reçue est comparée à ce que vous payiez avant.
                  </p>
                </div>
                <Mascot
                  name="loupe"
                  size={104}
                  alt="La mascotte Tarinéo qui cherche une information à la loupe"
                  className="ml-auto hidden shrink-0 sm:block"
                />
              </div>
            </LandingReveal>

            <LandingStagger className="flex flex-col gap-3" stagger={0.1} delay={0.05}>
              {problemOutputs.map((output) => (
                <LandingStaggerItem key={output}>
                  <motion.div
                    className="surface-flat flex items-center gap-3 rounded-full px-4 py-2.5"
                    whileHover={reduce ? undefined : { x: 4, transition: { duration: 0.2 } }}
                  >
                    <LandingIconPop
                      className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-accent-soft text-accent-700"
                    >
                      <Icon name="check" className="h-3.5 w-3.5" />
                    </LandingIconPop>
                    <span className="text-sm font-medium text-ink-900">{output}</span>
                  </motion.div>
                </LandingStaggerItem>
              ))}
            </LandingStagger>
          </div>

          <MarginProtectionScene className="mt-10" />

          <LandingReveal>
            <p className="eyebrow mt-8 flex flex-wrap items-center justify-center gap-3 text-center">
              <span>Vos informations</span>
              <motion.span
                aria-hidden
                className="text-accent"
                initial={{ opacity: 0, x: -6 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={LANDING_VIEW}
                transition={{ duration: 0.4, ease: LANDING_EASE, delay: 0.1 }}
              >
                →
              </motion.span>
              <span className="text-ink-900">Tarinéo</span>
              <motion.span
                aria-hidden
                className="text-accent"
                initial={{ opacity: 0, x: -6 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={LANDING_VIEW}
                transition={{ duration: 0.4, ease: LANDING_EASE, delay: 0.18 }}
              >
                →
              </motion.span>
              <span>Vos devis vérifiés</span>
            </p>
          </LandingReveal>
        </div>
      </div>
    </section>
  );
}
