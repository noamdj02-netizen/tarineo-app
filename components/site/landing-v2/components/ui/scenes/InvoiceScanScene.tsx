"use client";

import { motion, useInView, useReducedMotion } from "framer-motion";
import { useEffect, useRef, useState } from "react";

import { Badge } from "@/components/site/landing-v2/components/ui/Badge";
import { Icon } from "@/components/site/landing-v2/components/ui/Icon";
import { LANDING_EASE, LANDING_VIEW } from "@/components/site/landing-v2/lib/landing-motion";

const lines = [
  { ref: "PVC100", label: "Tube PVC Ø 100", qty: "6", price: "24,60 €", hot: true },
  { ref: "U1000", label: "Câble U1000 3G2,5", qty: "120 m", price: "3,84 €", hot: false },
  { ref: "C2S1", label: "Colle carrelage C2", qty: "4", price: "36,20 €", hot: false },
];

/**
 * Scène « analyse facture » : scan → surlignage → carte insight Tarinéo.
 * À placer au-dessus du tableau détaillé (section analyse).
 */
export function InvoiceScanScene({ className = "" }: { className?: string }) {
  const reduce = useReducedMotion();
  const rootRef = useRef<HTMLDivElement>(null);
  const inView = useInView(rootRef, { ...LANDING_VIEW, once: true });
  const [phase, setPhase] = useState(reduce ? 3 : 0);

  useEffect(() => {
    if (reduce || !inView) return;
    const steps = [
      () => setPhase(1),
      () => setPhase(2),
      () => setPhase(3),
    ];
    const delays = [200, 900, 1600];
    const timers = delays.map((ms, i) => window.setTimeout(steps[i], ms));
    return () => timers.forEach(clearTimeout);
  }, [inView, reduce]);

  return (
    <div
      ref={rootRef}
      className={`grid gap-4 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)] ${className}`}
    >
      <div className="landing-product-surface surface-flat relative overflow-hidden p-4 sm:p-5">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-sm font-semibold text-ink-900">Facture fournisseur</p>
            <p className="mt-0.5 text-xs text-ink-400">Rexel · n° FAC-2026-118</p>
          </div>
          <span className="rounded-sm bg-paper-50 px-2 py-1 text-[10px] font-medium tracking-wide text-ink-400 uppercase">
            PDF
          </span>
        </div>

        <ul className="relative mt-4 flex flex-col gap-2 border-t border-line pt-3">
          {lines.map((line, index) => (
            <motion.li
              key={line.ref}
              className="flex items-baseline justify-between gap-3 rounded-sm px-2 py-1.5 text-xs"
              animate={{
                backgroundColor:
                  phase >= 2 && line.hot
                    ? "rgba(236, 88, 33, 0.1)"
                    : "rgba(255,255,255,0)",
              }}
              initial={reduce ? false : { opacity: 0, y: 6 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={LANDING_VIEW}
              transition={{ delay: index * 0.05, duration: 0.35, ease: LANDING_EASE }}
            >
              <span className="truncate text-ink-600">{line.label}</span>
              <span className="shrink-0 text-ink-400 nums">
                {line.qty} · {line.price}
              </span>
            </motion.li>
          ))}

          {phase >= 1 && !reduce ? (
            <motion.div
              aria-hidden
              className="pointer-events-none absolute inset-x-0 top-0 h-8 bg-gradient-to-b from-accent/15 to-transparent"
              initial={{ y: -32, opacity: 0 }}
              animate={{ y: 72, opacity: [0, 1, 1, 0] }}
              transition={{ duration: 1.1, ease: LANDING_EASE }}
            />
          ) : null}
        </ul>

        <motion.p
          className="mt-3 border-t border-line pt-3 text-xs text-ink-400"
          animate={{ opacity: phase >= 1 ? 1 : 0.5 }}
        >
          Lecture des lignes…
        </motion.p>
      </div>

      <motion.div
        className="landing-product-surface surface-flat flex flex-col justify-center p-4 sm:p-5"
        initial={reduce ? false : { opacity: 0, y: 12, scale: 0.98 }}
        animate={
          reduce || phase >= 3
            ? { opacity: 1, y: 0, scale: 1 }
            : { opacity: 0.35, y: 8, scale: 0.99 }
        }
        transition={{ duration: 0.5, ease: LANDING_EASE }}
      >
        <div className="flex items-center gap-2">
          <span className="inline-flex h-8 w-8 items-center justify-center rounded-sm bg-accent-soft text-accent-700">
            <Icon name="spark" className="h-4 w-4" />
          </span>
          <p className="text-sm font-semibold text-ink-900">Analyse Tarinéo</p>
        </div>

        <p className="mt-3 text-sm text-ink-600">
          Tube PVC : vous payiez habituellement{" "}
          <span className="font-medium text-ink-900 nums">22,40 €</span>.
        </p>

        <div className="mt-3 flex flex-wrap items-center gap-2">
          <span className="text-sm text-ink-400 nums line-through">22,40 €</span>
          <span className="text-ink-300">→</span>
          <span className="text-sm font-semibold text-accent-700 nums">24,60 €</span>
          <Badge tone="accent" dot>+9,8 %</Badge>
        </div>

        <motion.p
          className="mt-4 rounded-md bg-paper-50 px-3 py-2.5 text-sm text-ink-600"
          initial={false}
          animate={{ opacity: phase >= 3 ? 1 : 0 }}
          transition={{ duration: 0.35 }}
        >
          Recommandation : renégocier ou changer de référence avant validation du devis.
        </motion.p>
      </motion.div>
    </div>
  );
}
