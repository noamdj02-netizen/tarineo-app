"use client";

import { useEffect, useState } from "react";
import {
  AlertTriangle,
  Check,
  FileUp,
  HardHat,
  RefreshCw,
} from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { PRODUCT_DEMO, PRODUCT_EASE } from "@/lib/site/product-demo";
import { cn } from "@/lib/utils";

const PHASES = [
  {
    id: "importer",
    label: "Importer",
    pill: "Nouveau devis fournisseur",
    floating: [
      { kind: "doc" as const, title: "Devis Cedeo.pdf", meta: "PDF · 1,2 Mo" },
      { kind: "check" as const, title: "Type détecté", meta: "Devis fournisseur" },
      { kind: "alert" as const, title: "Prêt à analyser", meta: "5 lignes extraites" },
    ],
  },
  {
    id: "analyser",
    label: "Analyser",
    pill: "Hausse de prix détectée",
    floating: [
      { kind: "alert" as const, title: "Tube PVC Ø 500", meta: "Cedeo Lyon · +9,8 %" },
      { kind: "check" as const, title: "Historique comparé", meta: "Dernier prix 442,80 €" },
      { kind: "doc" as const, title: "Nouveau prix", meta: "486,20 € HT" },
    ],
  },
  {
    id: "piloter",
    label: "Piloter",
    pill: "Marge chantier sous contrôle",
    floating: [
      { kind: "doc" as const, title: "Chantier Madame Dupont", meta: "4 documents liés" },
      { kind: "check" as const, title: "Devis client", meta: "7 171,20 €" },
      { kind: "alert" as const, title: "Achats", meta: "442,80 € · marge 93,8 %" },
    ],
  },
] as const;

/**
 * Hero motion — parallèle exact du pattern Mosey, contenu TARINEO.
 */
export function HeroMotionStage({ className }: { className?: string }) {
  const reduce = useReducedMotion();
  const [active, setActive] = useState(0);
  const phase = PHASES[active]!;
  const { hausse, chantier } = PRODUCT_DEMO;

  useEffect(() => {
    if (reduce) return;
    const id = window.setInterval(() => {
      setActive((i) => (i + 1) % PHASES.length);
    }, 4800);
    return () => window.clearInterval(id);
  }, [reduce]);

  return (
    <div className={cn("relative w-full", className)}>
      <div className="relative mx-auto flex min-h-[340px] max-w-[880px] items-center justify-center sm:min-h-[400px]">
        <svg
          aria-hidden
          className="pointer-events-none absolute inset-0 size-full"
          viewBox="0 0 880 400"
          fill="none"
        >
          <circle
            cx="440"
            cy="190"
            r="150"
            stroke="rgba(10,10,10,0.08)"
            strokeWidth="1"
            strokeDasharray="3 7"
          />
          <circle
            cx="440"
            cy="190"
            r="100"
            stroke="rgba(255,107,26,0.22)"
            strokeWidth="1.25"
            strokeDasharray="2 6"
          />
          <motion.path
            d="M40 320 C 160 280, 240 100, 440 160 S 720 300, 840 240"
            stroke="rgba(10,10,10,0.1)"
            strokeWidth="1.25"
            strokeDasharray="4 8"
            initial={reduce ? false : { pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 1.4, ease: PRODUCT_EASE }}
          />
          <motion.path
            d="M60 80 C 220 140, 340 40, 440 90 S 700 50, 820 110"
            stroke="rgba(255,107,26,0.35)"
            strokeWidth="1.5"
            initial={reduce ? false : { pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 1.5, ease: PRODUCT_EASE, delay: 0.1 }}
          />
          <path
            d="M0 360 Q 220 330 440 355 T 880 340"
            stroke="rgba(10,10,10,0.06)"
            strokeWidth="1.5"
          />
          <path
            d="M0 380 Q 220 350 440 375 T 880 360"
            stroke="rgba(255,107,26,0.12)"
            strokeWidth="1.5"
          />
        </svg>

        <AnimatePresence mode="wait">
          <motion.div
            key={phase.id}
            initial={reduce ? false : { opacity: 0, scale: 0.94 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={reduce ? undefined : { opacity: 0, scale: 0.96 }}
            transition={{ duration: 0.35, ease: PRODUCT_EASE }}
            className="relative z-[1] flex flex-col items-center"
          >
            <CenterArt phase={phase.id} haussePct={hausse.pct} margePct={chantier.margePct} />
            <motion.span
              initial={reduce ? false : { opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, ease: PRODUCT_EASE, delay: 0.1 }}
              className="mt-6 inline-flex rounded-full bg-[#0A0A0A] px-4 py-2 text-[13px] font-medium tracking-[-0.01em] text-white"
            >
              {phase.pill}
            </motion.span>
          </motion.div>
        </AnimatePresence>

        <FloatingCards key={phase.id} items={phase.floating} reduce={!!reduce} />
      </div>

      <div className="relative mt-2 border-t border-[rgba(10,10,10,0.08)] pt-5">
        <div
          role="tablist"
          aria-label="Étapes TARINEO"
          className="flex items-center justify-center gap-1 sm:gap-2"
        >
          {PHASES.map((p, i) => {
            const selected = i === active;
            return (
              <button
                key={p.id}
                type="button"
                role="tab"
                aria-selected={selected}
                onClick={() => setActive(i)}
                className={cn(
                  "relative min-h-11 rounded-[10px] px-3.5 py-2.5 text-[13px] font-medium tracking-[-0.01em] transition-colors duration-180 sm:px-6 sm:text-[15px]",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF6B1A]/40",
                  selected ? "text-[#0A0A0A]" : "text-[#6E6E6E] hover:text-[#0A0A0A]",
                )}
              >
                <span className="inline-flex items-center gap-2">
                  {selected ? (
                    <RefreshCw
                      className={cn(
                        "size-3.5 text-[#FF6B1A]",
                        !reduce && "animate-spin [animation-duration:2.4s]",
                      )}
                      aria-hidden
                    />
                  ) : null}
                  {p.label}
                </span>
                {selected ? (
                  <motion.span
                    layoutId="mosey-tab-line"
                    className="absolute inset-x-3 -bottom-px h-0.5 rounded-full bg-[#FF6B1A] sm:inset-x-5"
                    transition={{ duration: 0.28, ease: PRODUCT_EASE }}
                  />
                ) : null}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function CenterArt({
  phase,
  haussePct,
  margePct,
}: {
  phase: string;
  haussePct: number;
  margePct: number;
}) {
  if (phase === "importer") {
    return (
      <div className="grid size-[140px] place-items-center rounded-full border border-dashed border-[rgba(10,10,10,0.12)] bg-[#F5F5F3] sm:size-[160px]">
        <div className="flex flex-col items-center gap-2">
          <span className="grid size-12 place-items-center rounded-[14px] bg-[rgba(255,107,26,0.12)] text-[#FF6B1A]">
            <FileUp className="size-6" strokeWidth={1.75} aria-hidden />
          </span>
          <span className="text-[12px] font-semibold text-[#0A0A0A]">Déposer</span>
        </div>
      </div>
    );
  }
  if (phase === "analyser") {
    return (
      <div className="grid size-[140px] place-items-center rounded-full border border-[rgba(255,107,26,0.2)] bg-[rgba(255,107,26,0.06)] sm:size-[160px]">
        <p className="font-display text-[40px] font-semibold tracking-[-0.04em] text-[#FF6B1A] tabular-nums sm:text-[48px]">
          +{haussePct.toLocaleString("fr-FR")}%
        </p>
      </div>
    );
  }
  return (
    <div className="grid size-[140px] place-items-center rounded-full border border-[rgba(22,163,74,0.25)] bg-[rgba(22,163,74,0.06)] sm:size-[160px]">
      <div className="text-center">
        <HardHat className="mx-auto mb-1 size-5 text-[#FF6B1A]" strokeWidth={2} aria-hidden />
        <p className="font-display text-[32px] font-semibold tracking-[-0.04em] text-[#16A34A] tabular-nums sm:text-[36px]">
          {margePct.toLocaleString("fr-FR")}%
        </p>
        <p className="text-[11px] text-[#6E6E6E]">marge</p>
      </div>
    </div>
  );
}

function FloatingCards({
  items,
  reduce,
}: {
  items: readonly { kind: "doc" | "check" | "alert"; title: string; meta: string }[];
  reduce: boolean;
}) {
  const slots = [
    "left-2 top-[18%] sm:left-6 lg:left-2",
    "right-2 top-[22%] sm:right-6 lg:right-2",
    "bottom-[20%] left-[8%] sm:left-[12%] lg:left-[8%]",
  ];

  return (
    <>
      {items.map((item, i) => (
        <motion.div
          key={item.title}
          initial={reduce ? false : { opacity: 0, y: 10, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.32, ease: PRODUCT_EASE, delay: reduce ? 0 : 0.08 + i * 0.07 }}
          className={cn(
            "absolute z-[2] w-[min(210px,44vw)] rounded-[12px] border border-[rgba(10,10,10,0.08)] bg-[#FFFFFF]/95 px-3 py-2.5 shadow-[0_8px_24px_rgba(10,10,10,0.08)] backdrop-blur-sm",
            slots[i],
          )}
        >
          <div className="flex items-start gap-2.5">
            <span
              className={cn(
                "mt-0.5 grid size-7 shrink-0 place-items-center rounded-[8px]",
                item.kind === "alert" && "bg-[rgba(255,107,26,0.12)] text-[#FF6B1A]",
                item.kind === "check" && "bg-[#16A34A]/12 text-[#16A34A]",
                item.kind === "doc" && "bg-[#F5F5F3] text-[#0A0A0A]",
              )}
            >
              {item.kind === "alert" ? (
                <AlertTriangle className="size-3.5" strokeWidth={2} aria-hidden />
              ) : item.kind === "check" ? (
                <Check className="size-3.5" strokeWidth={2.5} aria-hidden />
              ) : (
                <FileUp className="size-3.5" strokeWidth={2} aria-hidden />
              )}
            </span>
            <div className="min-w-0">
              <p className="truncate text-[12px] font-semibold tracking-[-0.01em] text-[#0A0A0A]">
                {item.title}
              </p>
              <p className="truncate text-[11px] text-[#6E6E6E]">{item.meta}</p>
            </div>
          </div>
        </motion.div>
      ))}
    </>
  );
}
