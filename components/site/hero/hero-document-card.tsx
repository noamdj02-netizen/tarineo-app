"use client";

import { motion } from "framer-motion";
import { SupplierLogo } from "@/components/site/supplier-logo";
import type { HeroDoc } from "@/lib/site/product-demo";
import { cn } from "@/lib/utils";

const EASE = [0.32, 0.72, 0, 1] as const;

const TONE = {
  gain: "bg-wash-success text-st-focus-ink",
  alert: "bg-wash-badge text-wash-badge-ink",
} as const;

type HeroDocumentCardProps = {
  doc: HeroDoc;
  visible: boolean;
  detailed: boolean;
  scanning?: boolean;
  from?: "left" | "right";
  tilt?: number;
  stacked?: boolean;
  floatDelay?: number;
  peek?: boolean;
  enableFloat?: boolean;
  reduced: boolean;
  className?: string;
};

/** Pièce comptable du hero — surface alignée sur les tokens landing / app. */
export function HeroDocumentCard({
  doc,
  visible,
  detailed,
  scanning = false,
  from = "left",
  tilt = 0,
  stacked = false,
  floatDelay = 0,
  peek = false,
  enableFloat = true,
  reduced,
  className,
}: HeroDocumentCardProps) {
  const bodyOpacity = detailed ? 1 : peek ? 0.48 : 0;
  const slide = stacked ? "y" : "x";
  const offset = stacked ? 24 : from === "left" ? -46 : 46;
  const rotateY = stacked ? 0 : tilt;

  return (
    <motion.div
      className={cn("w-full", className)}
      initial={false}
      animate={
        visible
          ? { opacity: 1, [slide]: 0, scale: 1, rotateY }
          : { opacity: 0, [slide]: reduced ? 0 : offset, scale: 0.97, rotateY }
      }
      transition={reduced ? { duration: 0.2 } : { duration: 0.7, ease: EASE }}
      style={{ transformStyle: "preserve-3d" }}
    >
      <motion.article
        className="hero-card relative overflow-hidden"
        animate={reduced || !enableFloat ? undefined : { y: [0, -2, 0] }}
        transition={
          reduced || !enableFloat
            ? undefined
            : {
                duration: 9,
                ease: "easeInOut",
                repeat: Infinity,
                delay: floatDelay,
              }
        }
      >
        <header className="flex items-start justify-between gap-3 px-4 pt-4 sm:px-5 sm:pt-5">
          <h3 className="max-w-[9ch] font-display text-[19px] leading-[1.05] font-semibold tracking-[-0.03em] text-ink sm:text-[21px]">
            {doc.kind}
          </h3>
          {doc.tag ? (
            <span
              className={cn(
                "shrink-0 rounded-full px-2.5 py-1 text-[10px] font-semibold tracking-[0.06em] uppercase",
                doc.tag.toLowerCase() === "prêt"
                  ? "bg-wash-success text-st-focus-ink"
                  : "bg-tarineo-orange-soft text-wash-badge-ink",
              )}
            >
              {doc.tag}
            </span>
          ) : null}
        </header>

        <div className="flex items-center gap-2.5 px-4 pt-3.5 pb-3 sm:px-5">
          {doc.logo ? (
            <SupplierLogo name={doc.logo} size={30} className="rounded-[8px]" priority />
          ) : (
            <span
              aria-hidden
              className="grid size-[30px] shrink-0 place-items-center rounded-[8px] bg-search font-display text-[13px] font-bold text-ink"
            >
              {doc.party.charAt(0)}
            </span>
          )}
          <div className="min-w-0">
            <p className="truncate text-[13px] font-semibold tracking-[-0.01em] text-ink">
              {doc.party}
            </p>
            <p className="truncate text-[11px] text-muted-foreground">{doc.partyMeta}</p>
          </div>
        </div>

        <motion.div
          className="border-t border-line px-4 py-3 sm:px-5"
          initial={false}
          animate={{ opacity: bodyOpacity }}
          transition={reduced ? { duration: 0.2 } : { duration: 0.4, ease: EASE }}
        >
          <ul className="flex flex-col gap-2.5">
            {doc.lines.map((line, i) => (
              <motion.li
                key={line.label}
                initial={false}
                animate={{ opacity: bodyOpacity, y: detailed ? 0 : peek ? 0 : 6 }}
                transition={
                  reduced
                    ? { duration: 0.2 }
                    : { duration: 0.45, ease: EASE, delay: detailed ? 0.12 + i * 0.12 : 0 }
                }
              >
                {line.soft ? (
                  <span className="flex items-baseline justify-between gap-3">
                    <span className="text-[12px] text-muted-foreground">{line.label}</span>
                    {line.value ? (
                      <span className="shrink-0 text-[12px] text-muted-foreground tabular-nums">
                        {line.value}
                      </span>
                    ) : null}
                  </span>
                ) : (
                  <span className="flex items-baseline justify-between gap-3">
                    <span className="text-[12.5px] text-landing-ink-muted">{line.label}</span>
                    <span className="shrink-0 font-display text-[15px] font-semibold tracking-[-0.02em] text-ink tabular-nums">
                      {line.value}
                    </span>
                  </span>
                )}
              </motion.li>
            ))}
          </ul>

          {doc.highlight ? (
            <motion.p
              className="mt-3.5 flex items-center justify-between gap-3"
              initial={false}
              animate={{ opacity: bodyOpacity, scale: detailed ? 1 : 0.98 }}
              transition={
                reduced
                  ? { duration: 0.2 }
                  : { duration: 0.5, ease: EASE, delay: detailed ? 0.5 : 0 }
              }
            >
              <span className="text-[12px] font-medium text-wash-badge-ink">
                {doc.highlight.label}
              </span>
              <span
                className={cn(
                  "shrink-0 rounded-full px-2.5 py-1 font-display text-[13px] font-semibold tabular-nums",
                  TONE[doc.highlight.tone],
                )}
              >
                {doc.highlight.value}
              </span>
            </motion.p>
          ) : null}
        </motion.div>

        <motion.footer
          className="hero-card-footer flex items-baseline justify-between gap-3 px-4 py-3.5 sm:px-5"
          initial={false}
          animate={{ opacity: bodyOpacity }}
          transition={
            reduced
              ? { duration: 0.2 }
              : { duration: 0.45, ease: EASE, delay: detailed ? 0.62 : 0 }
          }
        >
          <span className="text-[11px] font-semibold tracking-[0.06em] text-muted-foreground uppercase">
            {doc.total.label}
          </span>
          <span className="font-display text-[17px] font-semibold tracking-[-0.025em] text-ink tabular-nums">
            {doc.total.value}
          </span>
        </motion.footer>

        {scanning && !reduced ? (
          <motion.span
            aria-hidden
            className="hero-scan-sheen pointer-events-none absolute inset-x-0 top-0 h-1/4"
            initial={{ y: "-120%", opacity: 0 }}
            animate={{ y: ["-120%", "320%"], opacity: [0, 1, 1, 0] }}
            transition={{ duration: 1.1, ease: "easeInOut" }}
          />
        ) : null}
      </motion.article>
    </motion.div>
  );
}
