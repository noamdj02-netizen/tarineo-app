"use client";

import { motion, useReducedMotion } from "framer-motion";
import { X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useRef } from "react";
import { EASE } from "@/components/motion/reveal";
import type { ProjectStatus } from "@/lib/projects/types";

/**
 * Fiche projet en panneau : glisse depuis le bas sur mobile, depuis la droite sur desktop.
 * Fermer = revenir à la liste (Échap, clic à côté, bouton ✕).
 */
export function ProjectSheet({
  name,
  status,
  children,
}: {
  name: string;
  status: ProjectStatus;
  children: React.ReactNode;
}) {
  const router = useRouter();
  const reduce = useReducedMotion();
  const panelRef = useRef<HTMLDivElement>(null);
  const close = () => router.back();

  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    panelRef.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && router.back();
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [router]);

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-end justify-end bg-ink/30 backdrop-blur-[3px] sm:items-stretch"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.25 }}
      onMouseDown={(e) => e.target === e.currentTarget && close()}
    >
      <motion.div
        ref={panelRef}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-label={name}
        initial={reduce ? { opacity: 0 } : { y: 40, x: 0, opacity: 0.4 }}
        animate={{ y: 0, x: 0, opacity: 1 }}
        transition={{ duration: 0.45, ease: EASE }}
        className="flex max-h-[94dvh] w-full flex-col overflow-hidden rounded-t-[22px] bg-bg shadow-lift outline-none sm:h-dvh sm:max-h-none sm:w-[min(760px,100%)] sm:rounded-none sm:rounded-l-[22px]"
      >
        <div className="flex items-center justify-between gap-3 border-b border-line bg-surface px-5 pt-3 pb-3 sm:pt-5">
          <div className="min-w-0">
            <p className="mono-label">
              {status === "focus" ? "/ Projet en focus" : "/ Projet en pause"}
            </p>
            <h2 className="truncate text-[26px] leading-tight font-semibold tracking-[-0.035em]">
              {name}
            </h2>
          </div>
          <button
            type="button"
            onClick={close}
            aria-label="Fermer"
            className="grid size-11 flex-none place-items-center rounded-pill border border-line bg-surface hover:bg-accent-soft"
          >
            <X className="size-5" aria-hidden />
          </button>
        </div>
        <div
          className="overflow-y-auto overscroll-contain px-4 pt-4 sm:px-5"
          style={{ paddingBottom: "calc(40px + env(safe-area-inset-bottom, 0px))" }}
        >
          {children}
        </div>
      </motion.div>
    </motion.div>
  );
}
