"use client";

import { motion, useReducedMotion } from "framer-motion";

import { analysedQuote, priceAlerts, priceHistory } from "@/lib/site/landing-v2-content";
import { AnimatedInlinePriceShift } from "@/components/site/landing-v2/components/ui/AnimatedPriceShift";
import { InvoiceScanScene } from "@/components/site/landing-v2/components/ui/scenes/InvoiceScanScene";
import { Badge } from "@/components/site/landing-v2/components/ui/Badge";
import { Icon } from "@/components/site/landing-v2/components/ui/Icon";
import { Mascot } from "@/components/site/landing-v2/components/ui/Mascot";
import { SectionHeading, SectionLabel } from "@/components/site/landing-v2/components/ui/SectionLabel";
import {
  LANDING_EASE,
  LANDING_VIEW,
  LandingFloatCard,
  LandingStagger,
  LandingStaggerItem,
} from "@/components/site/landing-v2/lib/landing-motion";

const tone = {
  over: "accent",
  ok: "muted",
  good: "success",
} as const;

export function QuoteAnalysis() {
  const reduce = useReducedMotion();

  return (
    <section id="analyse" className="py-20 sm:py-28">
      <div className="shell">
        <SectionHeading
          label="Analyse de devis"
          title={
            <>
              Ce devis est-il au bon prix ?
              <span className="mt-2 block text-ink-400">Tarinéo répond ligne par ligne.</span>
            </>
          }
          subtitle="Il retient ce que vous payez habituellement chez chaque fournisseur. À chaque devis reçu, il compare, chiffre l'écart et vous dit où vous payez trop — avant que vous validiez."
        />

        <InvoiceScanScene className="mt-14" />

        {/* Le devis analysé */}
        <LandingFloatCard className="landing-product-surface surface mt-6 overflow-hidden shadow-card" delay={0.08}>
          <div className="flex flex-wrap items-start justify-between gap-4 border-b border-line p-6 sm:p-7">
            <div>
              <SectionLabel>
                Devis fournisseur · {analysedQuote.supplier}
              </SectionLabel>
              <p className="mt-2 text-lg font-semibold text-ink-900">{analysedQuote.reference}</p>
              <p className="mt-1 text-sm text-ink-400 nums">
                {analysedQuote.date} · {analysedQuote.total}
              </p>
            </div>

            <div className="flex items-start gap-4">
              <Badge tone="accent" dot className="mt-1">
                {analysedQuote.gap} vs vos prix habituels
              </Badge>
              <Mascot
                name="loupe"
                widthClass="w-[88px] sm:w-[112px]"
                alt="La mascotte Tarinéo qui examine un devis à la loupe"
                className="-mt-2 -mb-8 -mr-1 shrink-0"
              />
            </div>
          </div>

          <div className="scroll-thin overflow-x-auto">
            <table className="w-full min-w-[36rem] border-collapse text-left">
              <caption className="sr-only">
                Comparaison de chaque ligne du devis fournisseur avec les prix habituels
              </caption>
              <thead>
                <tr className="border-b border-line bg-paper-50">
                  <th
                    scope="col"
                    className="px-6 py-3 text-xs font-medium tracking-wide text-ink-400 uppercase"
                  >
                    Article
                  </th>
                  <th
                    scope="col"
                    className="px-4 py-3 text-right text-xs font-medium tracking-wide text-ink-400 uppercase"
                  >
                    Qté
                  </th>
                  <th
                    scope="col"
                    className="px-4 py-3 text-right text-xs font-medium tracking-wide text-ink-400 uppercase"
                  >
                    Prix du devis
                  </th>
                  <th
                    scope="col"
                    className="px-4 py-3 text-right text-xs font-medium tracking-wide text-ink-400 uppercase"
                  >
                    Votre prix habituel
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-right text-xs font-medium tracking-wide text-ink-400 uppercase"
                  >
                    Écart
                  </th>
                </tr>
              </thead>
              <tbody>
                {analysedQuote.lines.map((line, index) => (
                  <motion.tr
                    key={line.ref}
                    className="border-b border-line last:border-b-0"
                    initial={reduce ? { opacity: 0 } : { opacity: 0, y: 8 }}
                    whileInView={reduce ? { opacity: 1 } : { opacity: 1, y: 0 }}
                    viewport={LANDING_VIEW}
                    transition={{
                      duration: 0.45,
                      ease: LANDING_EASE,
                      delay: 0.12 + index * 0.06,
                    }}
                  >
                    <th scope="row" className="px-6 py-4 text-left font-normal">
                      <span className="block text-sm font-medium text-ink-900">{line.label}</span>
                      <span className="mt-0.5 block text-xs text-ink-400">{line.ref}</span>
                    </th>
                    <td className="px-4 py-4 text-right text-sm text-ink-400 nums">{line.qty}</td>
                    <td className="px-4 py-4 text-right text-sm font-medium text-ink-900 nums">
                      {line.paid}
                    </td>
                    <td className="px-4 py-4 text-right text-sm text-ink-600 nums">
                      {line.usual}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Badge tone={tone[line.status]} dot>
                        {line.delta}
                      </Badge>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-4 border-t border-line bg-accent-soft px-6 py-5 sm:px-7">
            <div>
              <p className="text-[0.9375rem] font-semibold text-ink-900 nums">
                {analysedQuote.verdict}
              </p>
              <p className="mt-1 text-sm text-ink-600">{analysedQuote.advice}</p>
            </div>
            <span className="inline-flex items-center rounded-full bg-ink-900 px-5 py-2.5 text-sm font-medium text-white">
              Voir le détail des écarts
            </span>
          </div>
        </LandingFloatCard>

        {/* Suivi dans le temps */}
        <LandingStagger className="mt-6 grid gap-6 lg:grid-cols-2" stagger={0.1}>
          <LandingStaggerItem className="surface p-6 shadow-card sm:p-7">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <SectionLabel>Historique prix</SectionLabel>
                <p className="mt-2 text-[0.9375rem] font-medium text-ink-900">Chauffe-eau 200 L</p>
              </div>
              <Badge tone="accent" dot>
                +12 % en 9 mois
              </Badge>
            </div>

            <table className="mt-6 w-full border-collapse text-left">
              <caption className="sr-only">Évolution du prix du chauffe-eau 200 litres</caption>
              <thead>
                <tr className="border-b border-line">
                  <th
                    scope="col"
                    className="pb-3 text-xs font-medium tracking-wide text-ink-400 uppercase"
                  >
                    Période
                  </th>
                  <th
                    scope="col"
                    className="pb-3 text-right text-xs font-medium tracking-wide text-ink-400 uppercase"
                  >
                    Prix
                  </th>
                  <th
                    scope="col"
                    className="pb-3 text-right text-xs font-medium tracking-wide text-ink-400 uppercase"
                  >
                    Variation
                  </th>
                </tr>
              </thead>
              <tbody>
                {priceHistory.map((row, index) => (
                  <motion.tr
                    key={row.period}
                    className="border-b border-line last:border-b-0"
                    initial={reduce ? { opacity: 0 } : { opacity: 0, y: 6 }}
                    whileInView={reduce ? { opacity: 1 } : { opacity: 1, y: 0 }}
                    viewport={LANDING_VIEW}
                    transition={{
                      duration: 0.4,
                      ease: LANDING_EASE,
                      delay: 0.08 + index * 0.07,
                    }}
                  >
                    <th scope="row" className="py-3.5 text-sm font-normal text-ink-600">
                      {row.period}
                    </th>
                    <td className="py-3.5 text-right text-[0.9375rem] font-medium text-ink-900 nums">
                      {row.price}
                    </td>
                    <td className="py-3.5 text-right">
                      {row.delta ? (
                        <Badge tone="accent">{row.delta}</Badge>
                      ) : (
                        <span className="text-sm text-ink-300">référence</span>
                      )}
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>

            <div className="mt-6 flex items-center justify-between gap-4 rounded-md bg-paper-50 px-4 py-3.5">
              <span className="text-sm text-ink-600">Surcoût annuel estimé</span>
              <span className="text-[0.9375rem] font-semibold text-accent-700 nums">
                + 92 € / unité
              </span>
            </div>
          </LandingStaggerItem>

          <LandingStaggerItem className="surface p-6 shadow-card sm:p-7">
            <SectionLabel>Hausses détectées chez vos fournisseurs</SectionLabel>

            <ul className="mt-5 flex flex-col">
              {priceAlerts.map((alert, index) => (
                <motion.li
                  key={alert.name}
                  className="flex flex-wrap items-center gap-x-4 gap-y-2 border-b border-line py-4 last:border-b-0"
                  initial={reduce ? { opacity: 0 } : { opacity: 0, y: 8 }}
                  whileInView={reduce ? { opacity: 1 } : { opacity: 1, y: 0 }}
                  viewport={LANDING_VIEW}
                  transition={{
                    duration: 0.42,
                    ease: LANDING_EASE,
                    delay: index * 0.08,
                  }}
                >
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-ink-900">{alert.name}</p>
                    <p className="mt-0.5 text-sm text-ink-400">chez {alert.supplier}</p>
                  </div>
                  <AnimatedInlinePriceShift from={alert.from} to={alert.to} />
                  <Badge tone="accent" dot>
                    {alert.delta}
                  </Badge>
                </motion.li>
              ))}
            </ul>

            <div className="mt-6 flex items-start gap-3.5 border-t border-line pt-5">
              <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-sm bg-accent-soft text-accent-700">
                <Icon name="spark" className="h-4 w-4" />
              </span>
              <p className="text-sm text-ink-600">
                Tarinéo vous dit <span className="font-medium text-ink-900">où</span> la marge se
                perd, jamais à votre place.
              </p>
            </div>
          </LandingStaggerItem>
        </LandingStagger>
      </div>
    </section>
  );
}