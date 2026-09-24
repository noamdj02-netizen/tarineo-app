"use client";

import { motion, useReducedMotion } from "framer-motion";
import { X } from "lucide-react";
import { useEffect, useRef } from "react";
import { EASE } from "@/components/motion/reveal";
import { SECTION_LABELS, type PreLandingTemplate } from "@/lib/prelanding/templates";
import { PreviewFrame } from "./preview-frame";
import { useScrollLock } from "./use-scroll-lock";

/** Aperçu plein écran d'une pre-landing : la page entière, défilable. */
export function PreLandingModal({
  template,
  preview,
  onClose,
  onUse,
}: {
  template: PreLandingTemplate;
  preview: React.ReactNode;
  onClose: () => void;
  onUse: () => void;
}) {
  const reduce = useReducedMotion();
  const panelRef = useRef<HTMLDivElement>(null);

  useScrollLock();
  useEffect(() => {
    panelRef.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <motion.div
      className="fixed inset-0 z-50 bg-ink/30 backdrop-blur-[3px] sm:p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      onMouseDown={(e) => e.target === e.currentTarget && onClose()}
    >
      <motion.div
        ref={panelRef}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-label={`${template.name} preview`}
        initial={reduce ? { opacity: 0 } : { y: 24, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={reduce ? { opacity: 0 } : { y: 16, opacity: 0 }}
        transition={{ duration: 0.35, ease: EASE }}
        className="flex h-full flex-col overflow-hidden bg-bg shadow-lift outline-none sm:rounded-[22px]"
      >
        <div className="flex flex-none items-center justify-between gap-3 border-b border-line bg-surface px-4 py-3 sm:px-5">
          <div className="min-w-0">
            <p className="mono-label">/ Pre-landing {template.number}</p>
            <h2 className="truncate text-[20px] leading-tight font-semibold tracking-[-0.035em] sm:text-[22px]">
              {template.name}
              <span className="ml-2 hidden text-[15px] font-normal tracking-normal text-muted sm:inline">
                {template.description}
              </span>
            </h2>
          </div>
          <div className="flex flex-none items-center gap-2">
            <button
              type="button"
              onClick={onUse}
              className="btn-dark inline-flex min-h-11 items-center rounded-pill px-4 text-[14px] font-semibold"
            >
              Use this template
            </button>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close"
              className="grid size-11 flex-none place-items-center rounded-pill border border-line bg-surface hover:bg-accent-soft"
            >
              <X className="size-5" aria-hidden />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto overscroll-contain p-3 sm:p-6">
          <div className="mx-auto max-w-[1280px] overflow-hidden rounded-[14px] border border-line bg-surface shadow-soft">
            <PreviewFrame>{preview}</PreviewFrame>
          </div>
          <SectionList template={template} />
        </div>
      </motion.div>
    </motion.div>
  );
}

function SectionList({ template }: { template: PreLandingTemplate }) {
  return (
    <div className="mx-auto mt-6 max-w-[1280px] pb-6">
      <p className="mono-label">/ Structure · {template.sections.length} sections</p>
      <ol className="mt-3 flex flex-wrap gap-1.5">
        {template.sections.map((sec, i) => (
          <li
            key={`${sec.kind}-${i}`}
            className="rounded-pill border border-line bg-surface px-3 py-1.5 text-[13px] font-medium"
          >
            <span className="mr-1.5 font-mono text-[11px] text-muted">{String(i + 1).padStart(2, "0")}</span>
            {SECTION_LABELS[sec.kind]}
          </li>
        ))}
      </ol>
    </div>
  );
}
