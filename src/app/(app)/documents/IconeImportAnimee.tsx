"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { cn } from "@/lib/utils";

function IconeDocument({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 16 16" fill="none" className={className} aria-hidden="true">
      <path
        d="M4.5 2.5h4.2L10 4.8v6.7a1 1 0 0 1-1 1H4.5a1 1 0 0 1-1-1V3.5a1 1 0 0 1 1-1Z"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinejoin="round"
      />
      <path d="M8.5 2.5v2.5h2.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M5.5 8h4M5.5 10h3" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
    </svg>
  );
}

function IconeFlecheHausse({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 16 16" fill="none" className={className} aria-hidden="true">
      <path
        d="M3.5 11.5 6.8 7.5l2.2 2.5L11.2 6.5l1.8 1.8"
        stroke="currentColor"
        strokeWidth="1.25"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M11 6.5h2.5v2.5"
        stroke="currentColor"
        strokeWidth="1.25"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function IconePourcentage({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 16 16" fill="none" className={className} aria-hidden="true">
      <circle cx="5" cy="5" r="1.5" stroke="currentColor" strokeWidth="1.25" />
      <circle cx="11" cy="11" r="1.5" stroke="currentColor" strokeWidth="1.25" />
      <path d="M11 5 5 11" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" />
    </svg>
  );
}

const ICONES_CYCLE = [
  { id: "document", Icon: IconeDocument, label: "Lecture du document" },
  { id: "hausse", Icon: IconeFlecheHausse, label: "Analyse des prix" },
  { id: "pourcentage", Icon: IconePourcentage, label: "Calcul des économies" },
] as const;

function CercleOrange({ children, size = "md" }: { children: React.ReactNode; size?: "md" | "sm" }) {
  const cls =
    size === "sm"
      ? "relative flex size-[30px] items-center justify-center rounded-full bg-[#ec5821] text-white"
      : "relative flex size-12 items-center justify-center rounded-full bg-[#ec5821] text-white shadow-[0_4px_16px_rgba(236,88,33,0.32)]";

  return <div className={cls}>{children}</div>;
}

function CycleIconeAnime({
  iconClass,
  vitesse = "lente",
  actif = true,
}: {
  iconClass: string;
  vitesse?: "lente" | "rapide";
  actif?: boolean;
}) {
  const reduireMouvement = useReducedMotion();
  const [index, setIndex] = useState(0);
  const dureeMs = vitesse === "rapide" ? 900 : 1800;

  useEffect(() => {
    if (!actif || reduireMouvement) return;
    const id = window.setInterval(() => {
      setIndex((i) => (i + 1) % ICONES_CYCLE.length);
    }, dureeMs);
    return () => window.clearInterval(id);
  }, [actif, dureeMs, reduireMouvement]);

  const icone = ICONES_CYCLE[reduireMouvement ? 0 : index];

  return (
    <div className="relative flex size-full items-center justify-center">
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={icone.id}
          initial={{ opacity: 0, scale: 0.82 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.82 }}
          transition={{ duration: reduireMouvement ? 0 : 0.28, ease: [0.16, 1, 0.3, 1] }}
          className="flex items-center justify-center"
        >
          <icone.Icon className={iconClass} />
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

export function IconeImportAnimee({
  className,
  variant = "figma",
  vitesse = "lente",
  actif = true,
  pulseHalo = false,
}: {
  className?: string;
  variant?: "figma" | "large";
  vitesse?: "lente" | "rapide";
  actif?: boolean;
  pulseHalo?: boolean;
}) {
  const reduireMouvement = useReducedMotion();

  if (variant === "large") {
    return (
      <div
        className={cn("relative flex size-[72px] shrink-0 items-center justify-center", className)}
        role="img"
        aria-label="Import, analyse des hausses et suivi des économies"
      >
        <motion.div
          className="absolute inset-0 rounded-full bg-[#FFF0E8]"
          aria-hidden="true"
          animate={
            actif && pulseHalo && !reduireMouvement ? { scale: [1, 1.06, 1], opacity: [1, 0.92, 1] } : undefined
          }
          transition={actif && pulseHalo ? { duration: 2, repeat: Infinity, ease: "easeInOut" } : undefined}
        />
        <div className="relative z-[1]">
          <CercleOrange size="md">
            <div className="size-6">
              <CycleIconeAnime iconClass="size-6" vitesse={vitesse} actif={actif} />
            </div>
          </CercleOrange>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      className={cn(
        "relative size-12 shrink-0 rounded-[24px] bg-[#fff1f2]",
        className
      )}
      role="img"
      aria-label="Import, analyse des hausses et suivi des économies"
      animate={
        actif && pulseHalo && !reduireMouvement ? { scale: [1, 1.04, 1] } : undefined
      }
      transition={actif && pulseHalo ? { duration: 1.6, repeat: Infinity, ease: "easeInOut" } : undefined}
    >
      <div className="absolute inset-0 flex items-center justify-center">
        <CercleOrange size="sm">
          <div className="size-4">
            <CycleIconeAnime iconClass="size-4" vitesse={vitesse} actif={actif} />
          </div>
        </CercleOrange>
      </div>
    </motion.div>
  );
}

export function OverlayImportAnime({
  label,
  sousLabel,
}: {
  label?: string;
  sousLabel?: string;
}) {
  return (
    <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-3 rounded-[16px] bg-white/90 px-4 backdrop-blur-[3px]">
      <IconeImportAnimee variant="figma" vitesse="rapide" actif pulseHalo />
      <div className="text-center">
        <p className="text-[14px] font-semibold text-[#1f2937]">{label ?? "Envoi en cours…"}</p>
        {sousLabel && <p className="mt-1 text-[12px] text-[#6b7280]">{sousLabel}</p>}
      </div>
    </div>
  );
}
