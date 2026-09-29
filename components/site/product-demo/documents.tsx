"use client";

import { ArrowDown, FileUp } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";
import { SupplierLogo } from "@/components/site/supplier-logo";
import { MotionCard } from "@/components/site/product-demo/motion-card";
import { ProductDemoShell } from "@/components/site/product-demo/shell";
import { PRODUCT_DEMO, PRODUCT_EASE, PRODUCT_SPRING_FAST } from "@/lib/site/product-demo";
import { euro } from "@/lib/site/tarineo";
import { cn } from "@/lib/utils";

const LINES = [
  { ref: "JONC-50", label: "Joint Ø 500", qty: "4 u", price: 18.4, highlight: false },
  { ref: "PVC-500", label: "Tube PVC Ø 500", qty: "12 ml", price: 486.2, highlight: true },
  { ref: "COL-40", label: "Collier Ø 500", qty: "8 u", price: 38.4, highlight: false },
] as const;

/** Documents distributeur — aperçu PDF crédible + cascade de hausse. */
export function ProductDemoDocuments({ className }: { className?: string }) {
  const reduce = useReducedMotion();
  const { hausse, chantier } = PRODUCT_DEMO;

  return (
    <div className={cn("mx-auto w-full max-w-[1080px]", className)}>
      <ProductDemoShell title="Documents distributeur" bodyClassName="!p-0 sm:!p-0 bg-[#FFFFFF]">
        <div className="flex flex-wrap items-center gap-2 border-b border-[rgba(10,10,10,0.08)] px-4 py-3 sm:px-5">
          {["Tous chantiers", chantier.name].map((chip, i) => (
            <motion.span
              key={chip}
              initial={reduce ? false : { opacity: 0, y: 4 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ ...PRODUCT_SPRING_FAST, delay: i * 0.04 }}
              className={cn(
                "rounded-full px-3 py-1.5 text-[12px] font-medium tracking-[-0.01em]",
                i === 0
                  ? "bg-[rgba(255,107,26,0.12)] text-[#FF6B1A]"
                  : "bg-[#F5F5F3] text-[#6E6E6E]",
              )}
            >
              {chip}
            </motion.span>
          ))}
          <span className="ml-auto hidden items-center gap-1.5 text-[12px] text-[#6E6E6E] sm:inline-flex">
            <FileUp className="size-3.5 text-[#FF6B1A]" strokeWidth={2} aria-hidden />
            PDF · JPEG · HEIC
          </span>
        </div>

        <div className="grid gap-0 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)]">
          {/* Mini PDF — feuille fournisseur */}
          <div className="relative bg-[#E8E6E1] px-4 py-5 sm:px-6 sm:py-7">
            <motion.article
              initial={reduce ? false : { opacity: 0, y: 16, rotate: -0.6 }}
              whileInView={{ opacity: 1, y: 0, rotate: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.32, ease: PRODUCT_EASE }}
              className="relative mx-auto max-w-[340px] overflow-hidden rounded-[4px] bg-[#FFFFFF] shadow-[0_12px_40px_rgba(10,10,10,0.12)]"
            >
              {/* Coin page */}
              <span
                aria-hidden
                className="absolute top-0 right-0 size-8 bg-[linear-gradient(225deg,#E8E6E1_50%,transparent_50%)]"
              />

              <div className="border-b border-[rgba(10,10,10,0.08)] px-4 pt-4 pb-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <SupplierLogo name="Cedeo" size={28} className="rounded-[6px]" />
                    <div>
                      <p className="text-[11px] font-semibold tracking-[-0.01em] text-[#0A0A0A]">
                        CEDEO Lyon
                      </p>
                      <p className="text-[10px] text-[#6E6E6E]">Devis fournisseur</p>
                    </div>
                  </div>
                  <span className="rounded-[6px] bg-[#FF6B1A] px-2 py-0.5 text-[9px] font-bold tracking-[0.06em] text-white uppercase">
                    Devis
                  </span>
                </div>
                <div className="mt-3 flex justify-between text-[10px] text-[#6E6E6E]">
                  <span>N° DEV-2026-0842</span>
                  <span>12 mars 2026</span>
                </div>
              </div>

              <div className="px-4 py-3">
                <p className="text-[9px] tracking-[0.06em] text-[#6E6E6E] uppercase">Chantier</p>
                <p className="mt-0.5 text-[12px] font-medium text-[#0A0A0A]">{chantier.name}</p>
                <p className="text-[10px] text-[#6E6E6E]">{chantier.address}</p>
              </div>

              <table className="w-full border-t border-[rgba(10,10,10,0.06)] text-left">
                <thead>
                  <tr className="border-b border-[rgba(10,10,10,0.06)] text-[9px] tracking-[0.04em] text-[#6E6E6E] uppercase">
                    <th className="px-4 py-2 font-medium">Désignation</th>
                    <th className="px-2 py-2 font-medium">Qté</th>
                    <th className="px-4 py-2 text-right font-medium">HT</th>
                  </tr>
                </thead>
                <tbody>
                  {LINES.map((line, i) => (
                    <motion.tr
                      key={`${line.ref}-${i}`}
                      initial={reduce ? false : { opacity: 0, backgroundColor: "rgba(255,255,255,0)" }}
                      whileInView={
                        line.highlight
                          ? {
                              opacity: 1,
                              backgroundColor: [
                                "rgba(255,255,255,0)",
                                "rgba(255,107,26,0.14)",
                                "rgba(255,107,26,0.08)",
                              ],
                            }
                          : { opacity: 1 }
                      }
                      viewport={{ once: true }}
                      transition={
                        reduce
                          ? { duration: 0.12 }
                          : {
                              duration: line.highlight ? 0.7 : 0.25,
                              ease: PRODUCT_EASE,
                              delay: 0.2 + i * 0.08,
                            }
                      }
                      className={cn(
                        "text-[11px]",
                        line.highlight && "relative",
                      )}
                    >
                      <td className="px-4 py-2.5">
                        <span className="font-medium text-[#0A0A0A]">{line.label}</span>
                        <span className="mt-0.5 block font-mono text-[9px] text-[#6E6E6E]">
                          {line.ref}
                        </span>
                      </td>
                      <td className="px-2 py-2.5 tabular-nums text-[#6E6E6E]">{line.qty}</td>
                      <td className="px-4 py-2.5 text-right font-medium tabular-nums text-[#0A0A0A]">
                        {line.highlight ? euro(hausse.after) : euro(line.price)}
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>

              <div className="flex items-end justify-between border-t border-[rgba(10,10,10,0.08)] bg-[#FAFAF8] px-4 py-3">
                <div>
                  <p className="text-[9px] text-[#6E6E6E]">Ligne surveillée</p>
                  <p className="font-display text-[18px] font-semibold tracking-[-0.03em] tabular-nums text-[#0A0A0A]">
                    {euro(hausse.after)}
                  </p>
                </div>
                <motion.span
                  initial={reduce ? false : { opacity: 0, scale: 0.92, y: 6 }}
                  whileInView={{ opacity: 1, scale: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.25, ease: PRODUCT_EASE, delay: 0.45 }}
                  className="rounded-[8px] bg-[rgba(255,107,26,0.12)] px-2.5 py-1 text-[12px] font-bold text-[#FF6B1A] tabular-nums"
                >
                  +{hausse.pct.toLocaleString("fr-FR")} %
                </motion.span>
              </div>
            </motion.article>

            {/* Chip extraction flottante */}
            <motion.div
              initial={reduce ? false : { opacity: 0, x: 12, y: 8 }}
              whileInView={{ opacity: 1, x: 0, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.28, ease: PRODUCT_EASE, delay: 0.5 }}
              className="pointer-events-none absolute right-3 bottom-4 hidden max-w-[160px] rounded-[12px] border border-[rgba(10,10,10,0.08)] bg-[#FFFFFF] px-3 py-2.5 shadow-[0_8px_24px_rgba(10,10,10,0.1)] sm:right-5 sm:bottom-6 lg:block"
            >
              <p className="text-[10px] font-medium tracking-[0.04em] text-[#6E6E6E] uppercase">
                Ligne extraite
              </p>
              <p className="mt-1 text-[12px] font-semibold tracking-[-0.01em] text-[#0A0A0A]">
                {hausse.product}
              </p>
              <p className="text-[11px] text-[#FF6B1A] font-semibold">
                Hausse détectée
              </p>
            </motion.div>
          </div>

          {/* Cascade prix */}
          <MotionCard
            className="flex flex-col justify-center rounded-none border-0 border-t border-[rgba(10,10,10,0.08)] px-5 py-7 shadow-none sm:px-8 sm:py-9 lg:border-t-0 lg:border-l"
            delay={0.12}
          >
            <div className="mb-6 flex items-center gap-3">
              <SupplierLogo name="Cedeo" size={40} className="rounded-[10px]" />
              <div className="min-w-0">
                <p className="truncate text-[17px] font-semibold tracking-[-0.02em] text-[#0A0A0A]">
                  {hausse.product}
                </p>
                <p className="text-[13px] text-[#6E6E6E]">{hausse.supplier}</p>
              </div>
            </div>

            <ol>
              {[
                { label: "Prix fournisseur", value: euro(hausse.before), tone: "muted" as const },
                { label: "Nouveau prix", value: euro(hausse.after), tone: "ink" as const },
                {
                  label: "Variation",
                  value: `+${hausse.pct.toLocaleString("fr-FR")} %`,
                  tone: "accent" as const,
                },
              ].map((row, i) => (
                <li key={row.label}>
                  <motion.div
                    initial={reduce ? false : { opacity: 0, y: 8 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={
                      reduce
                        ? { duration: 0.12 }
                        : { duration: 0.22, ease: PRODUCT_EASE, delay: 0.15 + i * 0.1 }
                    }
                    className="rounded-[12px] bg-[#F5F5F3] px-4 py-3.5"
                  >
                    <p className="text-[12px] text-[#6E6E6E]">{row.label}</p>
                    <p
                      className={cn(
                        "mt-0.5 font-display font-semibold tracking-[-0.03em] tabular-nums",
                        row.tone === "accent" && "text-[30px] text-[#FF6B1A] sm:text-[34px]",
                        row.tone === "ink" && "text-[22px] text-[#0A0A0A]",
                        row.tone === "muted" && "text-[18px] text-[#6E6E6E] line-through",
                      )}
                    >
                      {row.value}
                    </p>
                  </motion.div>
                  {i < 2 ? (
                    <div className="flex justify-center py-1.5" aria-hidden>
                      <ArrowDown className="size-3.5 text-[#FF6B1A]/70" strokeWidth={2.5} />
                    </div>
                  ) : null}
                </li>
              ))}
            </ol>

            <p className="mt-5 text-[12px] leading-relaxed text-[#6E6E6E]">
              Lié à {chantier.name} · comparé à votre historique personnel
            </p>
          </MotionCard>
        </div>
      </ProductDemoShell>
    </div>
  );
}
