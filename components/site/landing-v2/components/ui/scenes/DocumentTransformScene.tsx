"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";

import { Icon } from "@/components/site/landing-v2/components/ui/Icon";
import {
  LANDING_EASE,
  LandingStagger,
  LandingStaggerItem,
} from "@/components/site/landing-v2/lib/landing-motion";
import {
  formatEuroHt,
  LANDING_QUOTE_DEMO,
  lineTotalHt,
  clientUnitFromSupplier,
  type LandingDemoLine,
} from "@/lib/site/landing-quote-transform-demo";

type Props = {
  marginPct: number;
  pulseKey: number;
  transforming?: boolean;
  supplierSubtitle?: string;
  extracting?: boolean;
  extracted?: boolean;
};

/** Continuité visuelle fournisseur → marge → client (données liées à la marge). */
export function DocumentTransformScene({
  marginPct,
  pulseKey,
  transforming,
  supplierSubtitle,
  extracting,
  extracted = false,
}: Props) {
  const reduce = useReducedMotion();
  const { lines } = LANDING_QUOTE_DEMO;
  const supplierTotal = lines.reduce((a, l) => a + lineTotalHt(l.qty, l.unitHt), 0);
  const clientTotal = lines.reduce(
    (a, l) => a + lineTotalHt(l.qty, clientUnitFromSupplier(l.unitHt, marginPct)),
    0,
  );

  const subtitle = supplierSubtitle ?? LANDING_QUOTE_DEMO.supplierSubtitle;

  return (
    <div className="relative grid gap-3 sm:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] sm:items-stretch">
      <DocCard
        title={LANDING_QUOTE_DEMO.supplierTitle}
        subtitle={subtitle}
        lines={lines}
        mode="supplier"
        marginPct={marginPct}
        total={supplierTotal}
        extracting={extracting}
        showLines={extracted}
      />

      <div className="relative mx-auto flex flex-col items-center justify-center gap-2 py-2 sm:py-0">
        <motion.span
          key={pulseKey}
          className="flex size-10 items-center justify-center rounded-full bg-accent-soft text-accent-700"
          initial={reduce ? false : { scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: extracted ? 1 : 0.45 }}
          transition={{ duration: 0.4, ease: LANDING_EASE }}
        >
          <Icon name="spark" className="h-4 w-4" />
        </motion.span>
        <span className="eyebrow whitespace-nowrap nums">Marge {marginPct} %</span>

        <AnimatePresence>
          {transforming && !reduce ? (
            <motion.span
              aria-hidden
              className="absolute left-1/2 top-1/2 size-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-accent"
              initial={{ x: -72, opacity: 0 }}
              animate={{ x: 72, opacity: [0, 1, 1, 0] }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.85, ease: LANDING_EASE }}
            />
          ) : null}
        </AnimatePresence>
      </div>

      <DocCard
        title={LANDING_QUOTE_DEMO.clientTitle}
        subtitle={LANDING_QUOTE_DEMO.clientSubtitle}
        lines={lines}
        mode="client"
        marginPct={marginPct}
        total={clientTotal}
        highlighted
        showLines={extracted}
        dimmed={!extracted}
      />
    </div>
  );
}

function DocCard({
  title,
  subtitle,
  lines,
  mode,
  marginPct,
  total,
  highlighted,
  extracting,
  showLines,
  dimmed,
}: {
  title: string;
  subtitle: string;
  lines: LandingDemoLine[];
  mode: "supplier" | "client";
  marginPct: number;
  total: number;
  highlighted?: boolean;
  extracting?: boolean;
  showLines?: boolean;
  dimmed?: boolean;
}) {
  const reduce = useReducedMotion();

  return (
    <motion.div
      className={`landing-product-surface surface-flat relative flex h-full flex-col p-4 ${
        highlighted ? "border-accent-100 shadow-card" : ""
      } ${dimmed ? "opacity-55" : ""}`}
      layout={!reduce}
      transition={{ duration: 0.35, ease: LANDING_EASE }}
    >
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm font-semibold text-ink-900">{title}</p>
        <span className="size-2.5 rounded-full bg-accent" aria-hidden />
      </div>
      <p className="mt-1 text-xs text-ink-400">{subtitle}</p>

      {extracting ? (
        <p className="mt-4 text-xs font-medium text-ink-500" role="status">
          Lecture du document…
        </p>
      ) : null}

      {showLines ? (
        <LandingStagger className="mt-3 border-t border-line pt-3" stagger={0.07}>
          <ul className="flex flex-col gap-2">
            {lines.map((line) => {
              const unit =
                mode === "supplier"
                  ? line.unitHt
                  : clientUnitFromSupplier(line.unitHt, marginPct);
              return (
                <LandingStaggerItem key={`${mode}-${line.ref}`}>
                  <li className="flex items-baseline justify-between gap-3 text-xs">
                    <span className="truncate text-ink-600">{line.label}</span>
                    <motion.span
                      className="shrink-0 nums text-ink-900"
                      key={`${mode}-${line.ref}-${marginPct}`}
                      initial={reduce ? false : { opacity: 0.6 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.25 }}
                    >
                      {line.qty} × {formatEuroHt(unit)}
                    </motion.span>
                  </li>
                </LandingStaggerItem>
              );
            })}
          </ul>
        </LandingStagger>
      ) : (
        <p className="mt-4 text-xs text-ink-400">
          {mode === "supplier" ? "Déposez un devis pour extraire les lignes." : "En attente de la transformation."}
        </p>
      )}

      {showLines ? (
        <motion.p
          className="mt-3 border-t border-line pt-3 text-sm font-semibold text-ink-900 nums"
          layout={!reduce}
        >
          {formatEuroHt(total)} HT
        </motion.p>
      ) : null}
    </motion.div>
  );
}
