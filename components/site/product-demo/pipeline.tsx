"use client";

import { ArrowDown, ArrowRight, FileText, Receipt, ShoppingCart } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";
import { PRODUCT_DEMO, PRODUCT_EASE } from "@/lib/site/product-demo";
import { cn } from "@/lib/utils";

const ICONS = [FileText, ShoppingCart, Receipt] as const;

/**
 * Cycle devis → commande → facture — stagger + ligne qui se dessine + étape active.
 * One-shot au scroll, pas de boucle.
 */
export function ProductDemoPipeline({ className }: { className?: string }) {
  const reduce = useReducedMotion();
  const steps = PRODUCT_DEMO.pipeline;

  return (
    <div className={cn("mx-auto w-full max-w-[900px]", className)}>
      <ul className="flex flex-col gap-0 sm:grid sm:grid-cols-3 sm:gap-3">
        {steps.map((step, i) => {
          const Icon = ICONS[i] ?? FileText;
          const delay = reduce ? 0 : 0.08 + i * 0.18;

          return (
            <li key={step.id} className="relative flex flex-col">
              <motion.div
                initial={reduce ? false : { opacity: 0, y: 14, scale: 0.97 }}
                whileInView={{ opacity: 1, y: 0, scale: 1 }}
                viewport={{ once: true, amount: 0.35 }}
                transition={{ duration: 0.28, ease: PRODUCT_EASE, delay }}
                className={cn(
                  "relative z-[1] h-full rounded-[14px] border border-[rgba(10,10,10,0.08)] bg-[#FFFFFF] px-4 py-5 sm:px-5",
                  "shadow-[0_1px_2px_rgba(10,10,10,0.04)]",
                )}
              >
                <div className="mb-3 flex items-center justify-between">
                  <motion.span
                    initial={reduce ? false : { scale: 0.85, opacity: 0 }}
                    whileInView={{ scale: 1, opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.22, ease: PRODUCT_EASE, delay: delay + 0.06 }}
                    className="grid size-10 place-items-center rounded-[12px] bg-[rgba(255,107,26,0.12)] text-[#FF6B1A]"
                  >
                    <Icon className="size-5" strokeWidth={1.75} aria-hidden />
                  </motion.span>
                  <motion.span
                    initial={reduce ? false : { opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.2, delay: delay + 0.1 }}
                    className="text-[11px] font-semibold tracking-[0.08em] text-[#FF6B1A] uppercase"
                  >
                    {step.label}
                  </motion.span>
                </div>
                <p className="text-[18px] font-semibold tracking-[-0.02em] text-[#0A0A0A]">
                  {step.label}
                </p>
                <p className="mt-1 text-[12px] text-[#6E6E6E]">{step.meta}</p>
                <motion.p
                  initial={reduce ? false : { opacity: 0, y: 6 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.22, ease: PRODUCT_EASE, delay: delay + 0.12 }}
                  className="mt-3 font-display text-[20px] font-semibold tracking-[-0.03em] tabular-nums text-[#0A0A0A]"
                >
                  {step.amount}
                </motion.p>

                {/* Accent bas qui s’allume à l’étape */}
                <motion.span
                  aria-hidden
                  initial={reduce ? false : { scaleX: 0 }}
                  whileInView={{ scaleX: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.28, ease: PRODUCT_EASE, delay: delay + 0.16 }}
                  className="absolute inset-x-4 bottom-0 h-0.5 origin-left rounded-full bg-[#FF6B1A]/70 sm:inset-x-5"
                />
              </motion.div>

              {i < steps.length - 1 ? (
                <div
                  className="relative flex items-center justify-center py-2.5 sm:absolute sm:top-1/2 sm:right-[-16px] sm:z-[2] sm:w-8 sm:-translate-y-1/2 sm:py-0"
                  aria-hidden
                >
                  {/* Mobile : flèche bas */}
                  <motion.div
                    initial={reduce ? false : { opacity: 0, y: -6 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.22, ease: PRODUCT_EASE, delay: delay + 0.2 }}
                    className="sm:hidden"
                  >
                    <ArrowDown className="size-4 text-[#FF6B1A]" strokeWidth={2.5} />
                  </motion.div>

                  {/* Desktop : ligne + flèche + point voyageur */}
                  <div className="relative hidden h-5 w-8 items-center sm:flex">
                    <motion.span
                      initial={reduce ? false : { scaleX: 0 }}
                      whileInView={{ scaleX: 1 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.32, ease: PRODUCT_EASE, delay: delay + 0.22 }}
                      className="absolute inset-y-[9px] left-0 right-1 origin-left rounded-full bg-[#FF6B1A]/45"
                      style={{ height: 2 }}
                    />
                    {!reduce ? (
                      <motion.span
                        initial={{ left: 0, opacity: 0 }}
                        whileInView={{
                          left: [0, 18],
                          opacity: [0, 1, 1, 0],
                        }}
                        viewport={{ once: true }}
                        transition={{
                          duration: 0.55,
                          ease: PRODUCT_EASE,
                          delay: delay + 0.28,
                          times: [0, 0.15, 0.85, 1],
                        }}
                        className="absolute top-1/2 size-1.5 -translate-y-1/2 rounded-full bg-[#FF6B1A]"
                      />
                    ) : null}
                    <motion.span
                      initial={reduce ? false : { opacity: 0, x: -4 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.2, ease: PRODUCT_EASE, delay: delay + 0.4 }}
                      className="absolute right-0"
                    >
                      <ArrowRight className="size-3.5 text-[#FF6B1A]" strokeWidth={2.5} />
                    </motion.span>
                  </div>
                </div>
              ) : null}
            </li>
          );
        })}
      </ul>

      <motion.p
        initial={reduce ? false : { opacity: 0, y: 8 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={reduce ? { duration: 0.12 } : { duration: 0.22, ease: PRODUCT_EASE, delay: 0.55 }}
        className="mt-6 text-center text-[15px] tracking-[-0.01em] text-[#0A0A0A] sm:text-[16px]"
      >
        Les lignes suivent.{" "}
        <span className="text-[#6E6E6E]">Vous ne ressaisissez pas.</span>
      </motion.p>
    </div>
  );
}
