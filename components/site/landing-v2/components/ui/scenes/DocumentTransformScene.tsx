"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";

import { Badge } from "@/components/site/landing-v2/components/ui/Badge";
import { Icon } from "@/components/site/landing-v2/components/ui/Icon";
import {
  LANDING_EASE,
  LandingStagger,
  LandingStaggerItem,
} from "@/components/site/landing-v2/lib/landing-motion";
import { cn } from "@/lib/utils";
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
  previewLines?: LandingDemoLine[];
  /** Colonne étroite (landing) : empilement vertical */
  compact?: boolean;
};

/** Continuité visuelle fournisseur → marge → client (données liées à la marge). */
export function DocumentTransformScene({
  marginPct,
  pulseKey,
  transforming,
  supplierSubtitle,
  extracting,
  extracted = false,
  previewLines,
  compact = false,
}: Props) {
  const reduce = useReducedMotion();
  const lines = previewLines?.length ? previewLines : LANDING_QUOTE_DEMO.lines;
  const supplierTotal = lines.reduce((a, l) => a + lineTotalHt(l.qty, l.unitHt), 0);
  const clientTotal = lines.reduce(
    (a, l) => a + lineTotalHt(l.qty, clientUnitFromSupplier(l.unitHt, marginPct)),
    0,
  );

  const subtitle = supplierSubtitle ?? LANDING_QUOTE_DEMO.supplierSubtitle;

  const gridClass = compact
    ? "grid grid-cols-1 gap-2"
    : "grid gap-3 sm:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] sm:items-stretch";

  return (
    <div className={cn("relative", gridClass)}>
      <DocCard
        title={LANDING_QUOTE_DEMO.supplierTitle}
        subtitle={subtitle}
        badge="Entrant"
        lines={lines}
        mode="supplier"
        marginPct={marginPct}
        total={supplierTotal}
        extracting={extracting}
        showLines={extracted}
      />

      <MarginBridge
        compact={compact}
        marginPct={marginPct}
        pulseKey={pulseKey}
        transforming={transforming}
        extracted={extracted}
        reduce={!!reduce}
      />

      <DocCard
        title={LANDING_QUOTE_DEMO.clientTitle}
        subtitle={LANDING_QUOTE_DEMO.clientSubtitle}
        badge="Sortant"
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

function MarginBridge({
  compact,
  marginPct,
  pulseKey,
  transforming,
  extracted,
  reduce,
}: {
  compact: boolean;
  marginPct: number;
  pulseKey: number;
  transforming?: boolean;
  extracted: boolean;
  reduce: boolean;
}) {
  return (
    <div
      className={cn(
        "relative flex items-center justify-center",
        compact ? "py-1" : "mx-auto flex-col gap-2 py-2 sm:py-0",
      )}
    >
      {compact ? (
        <motion.span
          aria-hidden
          className="absolute left-1/2 top-0 bottom-0 w-px -translate-x-1/2 origin-top bg-line"
          initial={false}
          animate={{
            scaleY: extracted || transforming ? 1 : 0.65,
            background:
              extracted || transforming
                ? "linear-gradient(to bottom, var(--color-line), color-mix(in srgb, var(--color-accent) 35%, transparent), var(--color-line))"
                : "var(--color-line)",
          }}
          transition={{ duration: 0.3, ease: LANDING_EASE }}
        />
      ) : null}

      <motion.div
        key={pulseKey}
        className={cn(
          "relative z-[1] flex items-center gap-2 rounded-full border bg-accent-soft px-3 py-1.5",
          compact && "shadow-sm",
          extracted ? "border-accent/35" : "border-accent/15",
        )}
        initial={reduce ? false : { scale: 0.96, opacity: 0 }}
        animate={{
          scale: 1,
          opacity: extracted ? 1 : 0.88,
          borderColor: extracted
            ? "color-mix(in srgb, var(--color-accent) 40%, transparent)"
            : "color-mix(in srgb, var(--color-accent) 18%, transparent)",
        }}
        transition={{ duration: 0.28, ease: LANDING_EASE }}
        whileTap={reduce ? undefined : { scale: 0.96 }}
      >
        <motion.span
          className="flex size-7 items-center justify-center rounded-full bg-paper-0 text-accent-700"
          animate={
            reduce
              ? undefined
              : {
                  rotate: transforming ? [0, 8, -8, 0] : 0,
                  scale: extracted ? 1 : 0.96,
                }
          }
          transition={{ duration: transforming ? 0.45 : 0.22, ease: LANDING_EASE }}
        >
          <Icon name="spark" className="h-3.5 w-3.5" />
        </motion.span>
        <span className="text-xs font-semibold text-ink-900 nums">
          Marge{" "}
          <AnimatePresence mode="popLayout" initial={false}>
            <motion.span
              key={marginPct}
              className="inline-block"
              initial={reduce ? false : { opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={reduce ? undefined : { opacity: 0, y: -5 }}
              transition={{ duration: 0.18, ease: LANDING_EASE }}
            >
              {marginPct} %
            </motion.span>
          </AnimatePresence>
        </span>
      </motion.div>

      <AnimatePresence>
        {transforming && !reduce ? (
          <motion.span
            aria-hidden
            className={cn(
              "absolute rounded-full bg-accent shadow-[0_0_0_3px_color-mix(in_srgb,var(--color-accent)_25%,transparent)]",
              compact
                ? "left-1/2 top-1/2 size-1.5 -translate-x-1/2 -translate-y-1/2"
                : "left-1/2 top-1/2 size-2 -translate-x-1/2 -translate-y-1/2",
            )}
            initial={{ y: compact ? -24 : 0, x: compact ? 0 : -64, opacity: 0, scale: 0.85 }}
            animate={
              compact
                ? { y: 24, opacity: [0, 1, 1, 0], scale: 1 }
                : { x: 64, opacity: [0, 1, 1, 0], scale: 1 }
            }
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.55, ease: LANDING_EASE }}
          />
        ) : null}
      </AnimatePresence>
    </div>
  );
}

function DocCard({
  title,
  subtitle,
  badge,
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
  badge: string;
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
      className={cn(
        "landing-product-surface surface-flat relative flex flex-col p-3.5 sm:p-4",
        highlighted && "border-accent-100 shadow-card ring-1 ring-accent/10",
        dimmed && "opacity-60",
      )}
      layout={!reduce}
      transition={{ duration: 0.35, ease: LANDING_EASE }}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-sm font-semibold text-ink-900">{title}</p>
            <Badge tone={mode === "client" ? "accent" : "muted"} size="sm">
              {badge}
            </Badge>
          </div>
          <p className="mt-1 truncate text-xs text-ink-400">{subtitle}</p>
        </div>
        <span
          className={cn(
            "flex size-8 shrink-0 items-center justify-center rounded-md border border-line bg-paper-50 text-ink-400",
            mode === "client" && showLines && "border-accent/25 bg-accent-soft text-accent-700",
          )}
          aria-hidden
        >
          <Icon name={mode === "supplier" ? "doc" : "invoice"} className="h-4 w-4" />
        </span>
      </div>

      {extracting && mode === "supplier" ? (
        <div className="mt-3 space-y-2" role="status" aria-live="polite">
          <p className="text-xs font-medium text-accent-700">Lecture du document…</p>
          <div className="space-y-1.5">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-2 animate-pulse rounded bg-paper-200"
                style={{ width: `${88 - i * 12}%` }}
              />
            ))}
          </div>
        </div>
      ) : null}

      {showLines ? (
        <LandingStagger className="mt-3 border-t border-line pt-3" stagger={0.06}>
          <ul className="max-h-36 space-y-1.5 overflow-y-auto pr-0.5 sm:max-h-44">
            {lines.map((line) => {
              const unit =
                mode === "supplier"
                  ? line.unitHt
                  : clientUnitFromSupplier(line.unitHt, marginPct);
              return (
                <LandingStaggerItem key={`${mode}-${line.ref}`}>
                  <li className="flex items-baseline justify-between gap-2 text-xs">
                    <span className="min-w-0 truncate text-ink-600">{line.label}</span>
                    <motion.span
                      className="shrink-0 nums font-medium text-ink-900"
                      key={`${mode}-${line.ref}-${marginPct}`}
                      initial={reduce ? false : { opacity: 0.5 }}
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
      ) : !extracting || mode !== "supplier" ? (
        <p className="mt-3 rounded-md border border-dashed border-line bg-paper-50/80 px-3 py-2.5 text-xs leading-snug text-ink-500">
          {mode === "supplier"
            ? "Les lignes apparaissent ici dès que vous déposez un devis à droite."
            : "Le devis client se remplit après l’analyse."}
        </p>
      ) : null}

      <div className="mt-auto border-t border-line pt-3">
        <div className="flex items-baseline justify-between gap-2">
          <span className="text-xs text-ink-400">Total HT</span>
          <motion.p
            className={cn(
              "text-sm font-semibold nums",
              showLines ? "text-ink-900" : "text-ink-300",
            )}
            layout={!reduce}
          >
            {showLines ? formatEuroHt(total) : "—"}
          </motion.p>
        </div>
      </div>
    </motion.div>
  );
}
