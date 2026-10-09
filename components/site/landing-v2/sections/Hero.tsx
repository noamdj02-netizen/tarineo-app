"use client";

import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";

import { ArrowRight, Button } from "@/components/site/landing-v2/components/ui/Button";
import { Badge } from "@/components/site/landing-v2/components/ui/Badge";
import { Mascot } from "@/components/site/landing-v2/components/ui/Mascot";
import { AnimatedPriceShift } from "@/components/site/landing-v2/components/ui/AnimatedPriceShift";
import { SectionLabel } from "@/components/site/landing-v2/components/ui/SectionLabel";
import {
  LANDING_EASE,
  LANDING_SPRING,
  LandingFloatCard,
  LandingHeroStagger,
  LandingMountItem,
  LandingMountSequence,
  LandingScanPass,
  LandingStaggerItem,
  landingMountItem,
  landingMountItemReduced,
} from "@/components/site/landing-v2/lib/landing-motion";
import { LANDING_PRIMARY_CTA_LABEL, LANDING_SIGNUP } from "@/lib/site/landing-v2-auth";
import { heroProof, heroQuote } from "@/lib/site/landing-v2-content";
import { HERO } from "@/lib/site/tarineo";

export function Hero() {
  const reduce = useReducedMotion();
  const { scrollY } = useScroll();
  const cardY = useTransform(scrollY, [0, 480], [0, reduce ? 0 : 14]);
  const lineItem = reduce ? landingMountItemReduced : landingMountItem;

  return (
    <section id="top" className="pt-28 pb-8 sm:pt-36 sm:pb-10 lg:pt-40 lg:pb-12">
      <div className="shell grid items-center gap-14 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.02fr)] lg:gap-16">
        <LandingHeroStagger className="min-w-0" stagger={0.09}>
          <LandingStaggerItem>
            <SectionLabel className="eyebrow-accent">{HERO.badge}</SectionLabel>
          </LandingStaggerItem>

          <LandingStaggerItem>
            <h1 className="mt-5 text-display font-semibold text-ink-900">
              {HERO.title}
              <br />
              <span className="hero-title-mark">{HERO.titleTail}</span>
            </h1>
          </LandingStaggerItem>

          <LandingStaggerItem>
            <p className="mt-6 max-w-xl text-body-lg text-ink-600">{HERO.text}</p>
          </LandingStaggerItem>

          <LandingStaggerItem>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <motion.div whileHover={reduce ? undefined : { y: -2 }} whileTap={reduce ? undefined : { scale: 0.97 }}>
                <Button href={LANDING_SIGNUP} size="lg">
                  {LANDING_PRIMARY_CTA_LABEL}
                  <ArrowRight />
                </Button>
              </motion.div>
              <motion.div whileHover={reduce ? undefined : { y: -2 }} whileTap={reduce ? undefined : { scale: 0.97 }}>
                <Button href={HERO.secondary.href} variant="secondary" size="lg">
                  {HERO.secondary.label}
                </Button>
              </motion.div>
            </div>
          </LandingStaggerItem>

          <LandingStaggerItem>
            <ul className="mt-10 flex flex-wrap items-center gap-x-3 gap-y-2 text-sm text-ink-400">
              {heroProof.map((item, index) => (
                <li key={item} className="flex items-center gap-3">
                  {index > 0 ? (
                    <span aria-hidden="true" className="size-1 rounded-full bg-line-strong" />
                  ) : null}
                  {item}
                </li>
              ))}
            </ul>
          </LandingStaggerItem>
        </LandingHeroStagger>

        <motion.div style={{ y: cardY }} className="relative min-w-0 pb-4 lg:pb-24">
          <LandingFloatCard className="relative" delay={0.1} trigger="mount">
            <div className="landing-product-surface relative surface overflow-hidden shadow-float">
              <LandingScanPass className="rounded-[inherit]" />

              <LandingMountSequence stagger={0.08} delay={0.1}>
                <LandingMountItem className="relative flex items-start justify-between gap-4 border-b border-line p-6 sm:p-7">
                  <div className="min-w-0 max-w-[19rem]">
                    <p className="eyebrow">Analyse de devis</p>
                    <p className="mt-2.5 text-xl font-semibold text-ink-900">
                      {heroQuote.supplier} · {heroQuote.reference}
                    </p>
                    <p className="mt-1.5 text-sm text-ink-400">{heroQuote.caption}</p>
                  </div>
                  <motion.div
                    initial={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.92, y: 8 }}
                    animate={reduce ? { opacity: 1 } : { opacity: 1, scale: 1, y: 0 }}
                    transition={{ ...LANDING_SPRING, delay: reduce ? 0 : 0.28 }}
                  >
                    <Mascot
                      name="hero"
                      widthClass="w-[124px] sm:w-[168px]"
                      priority
                      alt="La mascotte Tarinéo, pouce levé devant son ordinateur"
                      className="-mt-6 -mr-2 shrink-0 sm:-mr-3"
                    />
                  </motion.div>
                </LandingMountItem>

                <motion.ul
                  className="flex flex-col px-6 sm:px-7"
                  variants={{
                    hidden: {},
                    show: { transition: { staggerChildren: reduce ? 0 : 0.07, delayChildren: 0.04 } },
                  }}
                >
                  {heroQuote.lines.map((line) => (
                    <motion.li
                      key={line.ref}
                      className="flex items-center gap-4 border-b border-line py-4 last:border-b-0"
                      variants={lineItem}
                    >
                      <span className="min-w-0 flex-1">
                        <span className="block text-sm font-medium text-ink-900">{line.label}</span>
                        <span className="mt-1 block text-xs text-ink-400 nums">
                          {line.paid} <span className="text-ink-300">au lieu de</span> {line.usual}
                        </span>
                      </span>
                      <motion.span
                        initial={reduce ? false : { opacity: 0, scale: 0.92 }}
                        animate={reduce ? { opacity: 1 } : { opacity: 1, scale: 1 }}
                        transition={{ duration: 0.35, ease: LANDING_EASE, delay: 0.55 }}
                      >
                        <Badge tone="accent" dot>
                          {line.delta}
                        </Badge>
                      </motion.span>
                    </motion.li>
                  ))}
                </motion.ul>

                <LandingMountItem className="border-t border-line bg-accent-soft px-6 py-4 sm:px-7">
                  <p className="text-sm font-semibold text-ink-900">{heroQuote.verdict}</p>
                  <p className="mt-1 text-sm text-accent-700 nums">{heroQuote.overcost}</p>
                </LandingMountItem>
              </LandingMountSequence>
            </div>

            <motion.div
              className="surface pointer-events-none absolute -bottom-32 -left-4 hidden w-[15.5rem] p-4 shadow-float lg:block"
              initial={reduce ? { opacity: 0 } : { opacity: 0, y: 20, scale: 0.94 }}
              animate={reduce ? { opacity: 1 } : { opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.65, ease: LANDING_EASE, delay: reduce ? 0 : 0.72 }}
            >
              <p className="eyebrow">Chauffe-eau 200 L</p>
              <AnimatedPriceShift from="769 €" to="861 €" className="mt-2.5" />
              <p className="mt-3 flex items-center gap-2 text-sm text-ink-400">
                chez votre négoce
                <Badge tone="accent" dot className="ml-auto">
                  +12 % en 9 mois
                </Badge>
              </p>
            </motion.div>
          </LandingFloatCard>
        </motion.div>
      </div>
    </section>
  );
}
