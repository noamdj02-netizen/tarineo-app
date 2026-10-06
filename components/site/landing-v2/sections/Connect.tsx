"use client";

import { motion, useReducedMotion } from "framer-motion";

import { connectedSources, sourceCatalog } from "@/lib/site/landing-v2-content";
import { Icon } from "@/components/site/landing-v2/components/ui/Icon";
import { IntegrationBrandLogo } from "@/components/site/landing-v2/components/ui/IntegrationBrandLogo";
import { Mascot } from "@/components/site/landing-v2/components/ui/Mascot";
import { SectionHeading, SectionLabel } from "@/components/site/landing-v2/components/ui/SectionLabel";
import {
  LANDING_EASE,
  LANDING_VIEW,
  LandingFeatureCard,
  LandingFloatCard,
  LandingIconPop,
  LandingProgressBar,
  LandingStagger,
} from "@/components/site/landing-v2/lib/landing-motion";

export function Connect() {
  const reduce = useReducedMotion();

  return (
    <section id="connecter" className="py-20 sm:py-28">
      <div className="shell">
        <SectionHeading
          label="Connectez votre entreprise"
          title={
            <>
              Connectez vos outils.
              <span className="mt-2 block text-ink-400">Tarinéo comprend votre activité.</span>
            </>
          }
          subtitle="Vous branchez vos boîtes mail et vos dossiers. Tarinéo apprend vos fournisseurs, vos clients et vos habitudes de chiffrage — sans que vous ayez à tout ranger."
        />

        <div className="mt-14 grid gap-6 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)]">
          <div>
            <p className="eyebrow mb-4">Sources compatibles</p>
            <LandingStagger className="grid gap-3 sm:grid-cols-2" stagger={0.06}>
              {sourceCatalog.map((source) => (
                <LandingFeatureCard
                  key={source.label}
                  className="surface-flat flex items-start gap-3.5 p-4"
                >
                  <IntegrationBrandLogo
                    label={source.label}
                    size={36}
                    logoDomain={source.logoDomain}
                    iconFallback={source.icon}
                  />
                  <div>
                    <p className="text-sm font-medium text-ink-900">{source.label}</p>
                    <p className="mt-0.5 text-sm text-ink-400">{source.detail}</p>
                  </div>
                </LandingFeatureCard>
              ))}
            </LandingStagger>
          </div>

          <LandingFloatCard className="landing-product-surface surface self-start p-6 shadow-card sm:p-7" delay={0.1}>
            <div className="flex items-start justify-between gap-4">
              <SectionLabel>Sources connectées</SectionLabel>
              <Mascot
                name="ordinateur"
                size={96}
                alt="La mascotte Tarinéo devant son ordinateur"
                className="-mt-6 -mr-2 shrink-0"
              />
            </div>

            <ul className="mt-6 flex flex-col">
              {connectedSources.map((source, index) => (
                <motion.li
                  key={source.label}
                  className="flex items-center gap-3.5 border-b border-line py-3.5 last:border-b-0"
                  initial={reduce ? { opacity: 0 } : { opacity: 0, x: -10 }}
                  whileInView={reduce ? { opacity: 1 } : { opacity: 1, x: 0 }}
                  viewport={LANDING_VIEW}
                  transition={{
                    duration: 0.42,
                    ease: LANDING_EASE,
                    delay: 0.1 + index * 0.07,
                  }}
                >
                  {source.done ? (
                    <LandingIconPop>
                      <span className="relative inline-flex shrink-0">
                        <IntegrationBrandLogo
                          label={source.label}
                          size={28}
                          logoDomain={source.logoDomain}
                          iconFallback={source.icon}
                          rounded="full"
                          className="border-line-strong bg-paper-0"
                        />
                        <span
                          className="absolute -right-0.5 -bottom-0.5 inline-flex h-4 w-4 items-center justify-center rounded-full bg-accent text-white ring-2 ring-paper-0"
                          aria-hidden
                        >
                          <Icon name="check" className="h-2.5 w-2.5" strokeWidth={2.5} />
                        </span>
                      </span>
                    </LandingIconPop>
                  ) : (
                    <span className="relative inline-flex shrink-0 opacity-60">
                      <IntegrationBrandLogo
                        label={source.label}
                        size={28}
                        logoDomain={source.logoDomain}
                        iconFallback={source.icon}
                        rounded="full"
                        className="border-dashed border-line-strong bg-paper-50"
                      />
                    </span>
                  )}
                  <span className="text-[0.9375rem] font-medium text-ink-900">{source.label}</span>
                  <span className="ml-auto text-right text-sm text-ink-400">{source.detail}</span>
                </motion.li>
              ))}
            </ul>

            <div className="mt-6 rounded-md bg-paper-50 p-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-ink-600">Lecture de l&apos;activité</span>
                <span className="font-medium text-ink-900 nums">4 / 5 sources</span>
              </div>
              <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-paper-200">
                <LandingProgressBar percent={80} />
              </div>
              <p className="mt-3 text-sm text-ink-400">
                Le calendrier reste optionnel. Tarinéo fonctionne sans lui.
              </p>
            </div>
          </LandingFloatCard>
        </div>
      </div>
    </section>
  );
}
