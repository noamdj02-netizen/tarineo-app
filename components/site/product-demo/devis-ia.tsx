"use client";

import { useEffect, useRef, useState } from "react";
import { Check, FileText, Mic, PenLine, TriangleAlert, type LucideIcon } from "lucide-react";
import { AnimatePresence, motion, useInView, useReducedMotion } from "framer-motion";
import { ProductDemoShell } from "@/components/site/product-demo/shell";
import { PRODUCT_DEMO, PRODUCT_EASE } from "@/lib/site/product-demo";
import { euro } from "@/lib/site/tarineo";
import { cn } from "@/lib/utils";

const METHODS: {
  id: string;
  icon: LucideIcon;
  title: string;
  text: string;
  hint: string;
}[] = [
  {
    id: "analyser",
    icon: FileText,
    title: "Analyser un document",
    text: "Importez un devis, une facture ou un document fournisseur. TARINEO extrait client, chantier et lignes.",
    hint: "PDF · photo · scan",
  },
  {
    id: "creer",
    icon: PenLine,
    title: "Créer un devis",
    text: "Ajoutez prestations, matériaux et main-d’œuvre. PDF à votre logo et SIRET.",
    hint: "Saisie libre",
  },
  {
    id: "voix",
    icon: Mic,
    title: "Créer avec la voix",
    text: "Décrivez le chantier à voix haute. TARINEO structure les lignes pour vous.",
    hint: "Dictée",
  },
];

type Phase = "drop" | "scan" | "result";

/**
 * Devis IA — rail + séquence d’analyse : dépôt → scan → résultat.
 */
export function ProductDemoDevisIa({ className }: { className?: string }) {
  const reduce = useReducedMotion();
  const [active, setActive] = useState(0);
  const method = METHODS[active]!;
  const total = PRODUCT_DEMO.chantier.devis;

  return (
    <div className={cn("mx-auto w-full max-w-[1080px]", className)}>
      <ProductDemoShell title="Devis IA" bodyClassName="!p-0 sm:!p-0 bg-[#FFFFFF]">
        <div className="grid lg:grid-cols-[minmax(0,0.92fr)_minmax(0,1.2fr)]">
          <div className="flex flex-col border-b border-[rgba(10,10,10,0.08)] lg:border-r lg:border-b-0">
            <div className="px-5 pt-5 pb-3 sm:px-6 sm:pt-6">
              <p className="text-[11px] font-medium tracking-[0.08em] text-[#6E6E6E] uppercase">
                Point de départ
              </p>
            </div>

            <ul className="flex gap-1 overflow-x-auto px-3 pb-2 sm:px-4 lg:flex-col lg:gap-0.5 lg:overflow-visible lg:px-3 lg:pb-4">
              {METHODS.map((m, i) => {
                const MIcon = m.icon;
                const selected = i === active;
                return (
                  <li key={m.id} className="shrink-0 lg:w-full">
                    <button
                      type="button"
                      onClick={() => setActive(i)}
                      aria-pressed={selected}
                      className={cn(
                        "flex w-full min-h-11 items-center gap-3 rounded-[12px] px-3 py-3 text-left transition-[background-color,color] duration-180 ease-[cubic-bezier(0.2,0.8,0.2,1)]",
                        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF6B1A]/40",
                        selected
                          ? "bg-[#F5F5F3] text-[#0A0A0A]"
                          : "text-[#6E6E6E] hover:bg-[#F5F5F3]/70 hover:text-[#0A0A0A]",
                      )}
                    >
                      <span
                        className={cn(
                          "grid size-9 shrink-0 place-items-center rounded-[10px] transition-colors duration-180",
                          selected
                            ? "bg-[rgba(255,107,26,0.14)] text-[#FF6B1A]"
                            : "bg-transparent text-[#6E6E6E]",
                        )}
                      >
                        <MIcon className="size-[18px]" strokeWidth={1.75} aria-hidden />
                      </span>
                      <span className="min-w-0">
                        <span className="block text-[14px] font-semibold tracking-[-0.02em]">
                          {m.title}
                        </span>
                        <span className="mt-0.5 hidden text-[12px] text-[#6E6E6E] lg:block">
                          {m.hint}
                        </span>
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>

            <div className="border-t border-[rgba(10,10,10,0.06)] px-5 py-4 sm:px-6 lg:mt-auto lg:py-5">
              <AnimatePresence mode="wait">
                <motion.p
                  key={method.id}
                  initial={reduce ? false : { opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={reduce ? undefined : { opacity: 0, y: -4 }}
                  transition={{ duration: 0.18, ease: PRODUCT_EASE }}
                  className="text-[14px] leading-[1.55] text-[#6E6E6E] text-pretty"
                >
                  {method.text}
                </motion.p>
              </AnimatePresence>
            </div>
          </div>

          <div className="bg-[#F5F5F3] px-5 py-6 sm:px-8 sm:py-8">
            <AnimatePresence mode="wait">
              {active === 0 ? (
                <AnalysisSequence key="analyse" reduce={!!reduce} total={total} />
              ) : (
                <StaticPreview key={method.id} method={method} reduce={!!reduce} />
              )}
            </AnimatePresence>
          </div>
        </div>
      </ProductDemoShell>
    </div>
  );
}

function AnalysisSequence({ reduce, total }: { reduce: boolean; total: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.35 });
  const [phase, setPhase] = useState<Phase>(reduce ? "result" : "drop");
  const [status, setStatus] = useState(reduce ? "Terminé" : "Dépôt…");

  useEffect(() => {
    if (reduce) {
      setPhase("result");
      setStatus("Terminé");
      return;
    }
    if (!inView) return;

    setPhase("drop");
    setStatus("Dépôt du devis…");
    const t1 = window.setTimeout(() => {
      setPhase("scan");
      setStatus("Analyse des lignes…");
    }, 520);
    const t2 = window.setTimeout(() => {
      setPhase("result");
      setStatus("Terminé");
    }, 1480);
    return () => {
      window.clearTimeout(t1);
      window.clearTimeout(t2);
    };
  }, [inView, reduce]);

  const done = phase === "result";

  return (
    <div ref={ref} className="relative min-h-[420px]">
      <div className="mb-5 flex items-end justify-between gap-4">
        <div>
          <p className="text-[11px] font-medium tracking-[0.08em] text-[#6E6E6E] uppercase">
            Analyse en direct
          </p>
          <h3 className="mt-1.5 font-display text-[22px] font-semibold tracking-[-0.03em] text-[#0A0A0A] sm:text-[26px]">
            Analyse du devis
          </h3>
        </div>
        <motion.span
          key={status}
          initial={reduce ? false : { opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          className={cn(
            "shrink-0 rounded-[8px] px-2.5 py-1 text-[11px] font-semibold",
            done
              ? "bg-[#16A34A]/12 text-[#16A34A]"
              : "bg-[rgba(255,107,26,0.12)] text-[#FF6B1A]",
          )}
        >
          {status}
        </motion.span>
      </div>

      {/* Zone document + résultats */}
      <div className="relative flex flex-col gap-4">
        {/* Document qui se pose → reste en vignette après analyse */}
        <motion.div
          initial={reduce ? false : { opacity: 0, y: -36, rotate: -3, scale: 0.94 }}
          animate={
            phase === "result"
              ? { opacity: 1, y: 0, rotate: 0, scale: 1, height: "auto" }
              : { opacity: 1, y: 0, rotate: 0, scale: 1 }
          }
          transition={{ duration: 0.4, ease: PRODUCT_EASE }}
          className={cn(
            "relative mx-auto w-full overflow-hidden rounded-[6px] bg-[#FFFFFF]",
            "border border-[rgba(10,10,10,0.08)] shadow-[0_16px_40px_rgba(10,10,10,0.1)]",
            done ? "max-w-none" : "max-w-[280px]",
          )}
        >
          <div
            className={cn(
              "flex items-center justify-between border-b border-[rgba(10,10,10,0.06)] px-3.5",
              done ? "py-2" : "py-2.5",
            )}
          >
            <div>
              <p className="text-[10px] font-semibold text-[#0A0A0A]">Devis fournisseur</p>
              <p className="text-[9px] text-[#6E6E6E]">Cedeo Lyon · PDF</p>
            </div>
            <span className="rounded bg-[#FF6B1A] px-1.5 py-0.5 text-[8px] font-bold tracking-wide text-white uppercase">
              Devis
            </span>
          </div>

          {!done ? (
            <div className="space-y-2 px-3.5 py-3">
              <div className="h-2 w-2/3 rounded-full bg-[#F5F5F3]" />
              <div className="h-2 w-1/2 rounded-full bg-[#F5F5F3]" />
              <div className="mt-3 space-y-1.5">
                {[1, 0.85, 0.7, 0.9].map((w, i) => (
                  <div key={i} className="flex items-center justify-between gap-3">
                    <div className="h-1.5 rounded-full bg-[#EEEBE4]" style={{ width: `${w * 62}%` }} />
                    <div className="h-1.5 w-10 rounded-full bg-[#EEEBE4]" />
                  </div>
                ))}
              </div>
              <div className="mt-3 flex justify-end">
                <div className="h-3 w-20 rounded-full bg-[#0A0A0A]/10" />
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-between px-3.5 py-2 text-[11px] text-[#6E6E6E]">
              <span>Madame Dupont · {PRODUCT_DEMO.chantier.name}</span>
              <span className="font-medium tabular-nums text-[#0A0A0A]">{euro(total)}</span>
            </div>
          )}

          {phase === "scan" && !reduce ? (
            <motion.div
              aria-hidden
              className="pointer-events-none absolute inset-x-0 h-8"
              initial={{ top: "12%", opacity: 0 }}
              animate={{ top: ["12%", "82%"], opacity: [0, 1, 1, 0] }}
              transition={{ duration: 0.85, ease: PRODUCT_EASE, times: [0, 0.12, 0.88, 1] }}
            >
              <div className="h-full bg-gradient-to-b from-transparent via-[rgba(255,107,26,0.22)] to-transparent" />
              <div className="absolute inset-x-0 top-1/2 h-px bg-[#FF6B1A]/80" />
            </motion.div>
          ) : null}
        </motion.div>

        <AnimatePresence>
          {done ? (
            <motion.div
              initial={reduce ? false : { opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.28, ease: PRODUCT_EASE }}
            >
              <div className="mb-3 flex items-center gap-2">
                <span className="grid size-6 place-items-center rounded-full bg-[#16A34A] text-white">
                  <Check className="size-3.5" strokeWidth={3} aria-hidden />
                </span>
                <p className="text-[13px] font-medium text-[#0A0A0A]">Extraction terminée</p>
              </div>

              <div className="overflow-hidden rounded-[14px] border border-[rgba(10,10,10,0.08)] bg-[#FFFFFF] px-5 py-2 shadow-[0_1px_2px_rgba(10,10,10,0.04)] sm:px-6">
                <ul>
                  {PRODUCT_DEMO.analysisChecks.map((label, i) => (
                    <motion.li
                      key={label}
                      initial={reduce ? false : { opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{
                        duration: 0.22,
                        ease: PRODUCT_EASE,
                        delay: reduce ? 0 : 0.08 + i * 0.09,
                      }}
                      className="flex items-center gap-3 border-b border-[rgba(10,10,10,0.06)] py-3 last:border-b-0"
                    >
                      <motion.span
                        initial={reduce ? false : { scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{
                          duration: 0.2,
                          ease: PRODUCT_EASE,
                          delay: reduce ? 0 : 0.12 + i * 0.09,
                        }}
                        className="grid size-5 shrink-0 place-items-center rounded-full bg-[#16A34A] text-white"
                      >
                        <Check className="size-3" strokeWidth={3} aria-hidden />
                      </motion.span>
                      <span className="text-[14px] tracking-[-0.01em] text-[#0A0A0A] sm:text-[15px]">
                        {label}
                      </span>
                    </motion.li>
                  ))}
                </ul>
              </div>

              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <motion.div
                  initial={reduce ? false : { opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    duration: 0.25,
                    ease: PRODUCT_EASE,
                    delay: reduce ? 0 : 0.55,
                  }}
                  className="flex flex-col justify-between rounded-[14px] border border-[rgba(10,10,10,0.08)] bg-[#FFFFFF] px-5 py-4"
                >
                  <p className="text-[12px] font-medium tracking-[-0.01em] text-[#6E6E6E]">
                    Total HT
                  </p>
                  <p className="mt-3 font-display text-[32px] leading-none font-semibold tracking-[-0.035em] text-[#0A0A0A] tabular-nums sm:text-[36px]">
                    {euro(total)}
                  </p>
                </motion.div>

                <motion.div
                  initial={reduce ? false : { opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    duration: 0.25,
                    ease: PRODUCT_EASE,
                    delay: reduce ? 0 : 0.65,
                  }}
                  className="rounded-[14px] border border-[rgba(255,107,26,0.22)] bg-[#FFFFFF] px-4 py-4 sm:px-5"
                >
                  <div className="flex items-start gap-3">
                    <span className="grid size-9 shrink-0 place-items-center rounded-[10px] bg-[rgba(255,107,26,0.12)] text-[#FF6B1A]">
                      <TriangleAlert className="size-4" strokeWidth={2} aria-hidden />
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-baseline justify-between gap-2">
                        <p className="text-[13px] font-semibold tracking-[-0.015em] text-[#0A0A0A]">
                          Points à vérifier
                        </p>
                        <span className="rounded-full bg-[rgba(255,107,26,0.12)] px-2 py-0.5 font-display text-[13px] font-semibold tabular-nums text-[#FF6B1A]">
                          {PRODUCT_DEMO.analysisPoints}
                        </span>
                      </div>
                      <ul className="mt-3 space-y-2">
                        {PRODUCT_DEMO.analysisReviewItems.map((item, i) => (
                          <motion.li
                            key={item}
                            initial={reduce ? false : { opacity: 0, x: 6 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{
                              duration: 0.2,
                              ease: PRODUCT_EASE,
                              delay: reduce ? 0 : 0.72 + i * 0.08,
                            }}
                            className="flex items-start gap-2 text-[12px] leading-snug text-[#6E6E6E]"
                          >
                            <span
                              aria-hidden
                              className="mt-1.5 size-1.5 shrink-0 rounded-full bg-[#FF6B1A]"
                            />
                            <span>{item}</span>
                          </motion.li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </motion.div>
              </div>
            </motion.div>
          ) : null}
        </AnimatePresence>
      </div>
    </div>
  );
}

function StaticPreview({
  method,
  reduce,
}: {
  method: (typeof METHODS)[number];
  reduce: boolean;
}) {
  const Icon = method.icon;
  return (
    <motion.div
      initial={reduce ? false : { opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={reduce ? undefined : { opacity: 0, y: -6 }}
      transition={{ duration: 0.22, ease: PRODUCT_EASE }}
      className="flex min-h-[320px] flex-col justify-center"
    >
      <span className="mb-4 grid size-12 place-items-center rounded-[14px] bg-[rgba(255,107,26,0.12)] text-[#FF6B1A]">
        <Icon className="size-6" strokeWidth={1.75} aria-hidden />
      </span>
      <h3 className="font-display text-[22px] font-semibold tracking-[-0.03em] text-[#0A0A0A]">
        {method.title}
      </h3>
      <p className="mt-3 max-w-[36ch] text-[15px] leading-[1.55] text-[#6E6E6E] text-pretty">
        {method.text}
      </p>
    </motion.div>
  );
}
