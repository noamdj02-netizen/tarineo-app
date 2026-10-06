"use client";

import { motion, useInView, useReducedMotion } from "framer-motion";
import { useEffect, useRef, useState } from "react";

import { Badge } from "@/components/site/landing-v2/components/ui/Badge";
import { Icon } from "@/components/site/landing-v2/components/ui/Icon";
import { LANDING_EASE, LANDING_VIEW } from "@/components/site/landing-v2/lib/landing-motion";

const steps = [
  { key: "achat", label: "Achat", value: "1 310 € HT", width: 100 },
  { key: "hausse", label: "Hausse détectée", value: "+4,2 %", width: 88 },
  { key: "marge", label: "Marge chantier", value: "32 % → 24 %", width: 62 },
  { key: "action", label: "Action Tarinéo", value: "Alerte + alternative", width: 78 },
  { key: "protegee", label: "Marge protégée", value: "31 %", width: 92 },
] as const;

/** Scène « protection de marge » — barre qui se réduit puis se rétablit. */
export function MarginProtectionScene({ className = "" }: { className?: string }) {
  const reduce = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { ...LANDING_VIEW, once: true });
  const [active, setActive] = useState(reduce ? steps.length - 1 : 0);

  useEffect(() => {
    if (reduce || !inView) return;
    let i = 0;
    const id = window.setInterval(() => {
      i += 1;
      if (i >= steps.length) {
        window.clearInterval(id);
        return;
      }
      setActive(i);
    }, 700);
    return () => window.clearInterval(id);
  }, [inView, reduce]);

  const barWidth = steps[active]?.width ?? 100;

  return (
    <div ref={ref} className={`landing-product-surface surface p-5 sm:p-6 ${className}`}>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm font-semibold text-ink-900">Coût réel → marge → décision</p>
        <Badge tone="accent" dot>Exemple chantier</Badge>
      </div>

      <ol className="mt-5 flex flex-wrap gap-2 sm:gap-3">
        {steps.map((step, index) => (
          <li key={step.key}>
            <motion.span
              className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-medium ${
                index === active
                  ? "border-accent-100 bg-accent-soft text-accent-700"
                  : "border-line bg-paper-0 text-ink-500"
              }`}
              animate={{ scale: index === active ? 1 : 0.98, opacity: index <= active ? 1 : 0.55 }}
              transition={{ duration: 0.35, ease: LANDING_EASE }}
            >
              {index > 0 ? <span className="text-accent" aria-hidden>→</span> : null}
              {step.label}
            </motion.span>
          </li>
        ))}
      </ol>

      <div className="mt-6">
        <div className="flex items-center justify-between text-sm">
          <span className="text-ink-600">Marge disponible</span>
          <motion.span
            key={steps[active].value}
            className="font-semibold text-ink-900 nums"
            initial={reduce ? false : { opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, ease: LANDING_EASE }}
          >
            {steps[active].value}
          </motion.span>
        </div>
        <div className="mt-2 h-2 overflow-hidden rounded-full bg-paper-200">
          <motion.div
            className="h-full rounded-full bg-[linear-gradient(90deg,var(--color-accent-fill),var(--color-accent))]"
            animate={{ width: `${barWidth}%` }}
            transition={{ duration: reduce ? 0.2 : 0.55, ease: LANDING_EASE }}
          />
        </div>
      </div>

      <motion.div
        className="mt-5 flex items-start gap-3 rounded-md bg-paper-50 px-4 py-3"
        animate={{ opacity: active >= 3 ? 1 : 0.4 }}
        transition={{ duration: 0.35 }}
      >
        <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-sm bg-accent-soft text-accent-700">
          <Icon name="shield" className="h-4 w-4" />
        </span>
        <p className="text-sm text-ink-600">
          Tarinéo signale la hausse avant facturation client et propose une marge cible à maintenir.
        </p>
      </motion.div>
    </div>
  );
}
