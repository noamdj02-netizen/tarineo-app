"use client";

import { AnimatePresence, motion, type Variants } from "framer-motion";
import { CheckCircle2, Loader2, XCircle } from "lucide-react";

import { cn } from "@/lib/utils";

export type StatusState = "pending" | "failed" | "success";

export type LandingStatusBadgeProps = {
  state?: StatusState;
  labels?: Partial<Record<StatusState, string>>;
  className?: string;
};

/** Labels métier — relances commerciales & clients. */
const DEFAULT_LABELS: Record<StatusState, string> = {
  pending: "En cours",
  failed: "Sans réponse",
  success: "Répondu",
};

const STATE_CLASSES: Record<
  StatusState,
  { icon: string; wrap: string; glow: string }
> = {
  pending: {
    icon: "text-accent-700",
    wrap: "border-accent/25 bg-accent-soft text-accent-700",
    glow: "bg-accent/40",
  },
  failed: {
    icon: "text-warning",
    wrap: "border-warning/25 bg-warning-soft text-warning",
    glow: "bg-warning/35",
  },
  success: {
    icon: "text-success",
    wrap: "border-success/25 bg-success-soft text-success",
    glow: "bg-success/35",
  },
};

const ICON_VARIANTS: Variants = {
  hidden: { scale: 0.4, opacity: 0 },
  visible: {
    scale: 1,
    opacity: 1,
    transition: { duration: 0.28, ease: [0.22, 1, 0.36, 1] },
  },
  exit: {
    scale: 0.4,
    opacity: 0,
    transition: { duration: 0.15 },
  },
};

const LABEL_VARIANTS: Variants = {
  hidden: { opacity: 0, y: 4 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.22, ease: [0.22, 1, 0.36, 1] },
  },
  exit: {
    opacity: 0,
    y: -4,
    transition: { duration: 0.14 },
  },
};

function StateIcon({ state }: { state: StatusState }) {
  const cls = STATE_CLASSES[state].icon;
  if (state === "pending") {
    return (
      <motion.span
        animate={{ rotate: 360 }}
        transition={{ duration: 1.8, repeat: Infinity, ease: "linear" }}
        className={cn("flex", cls)}
      >
        <Loader2 size={14} strokeWidth={2.5} aria-hidden />
      </motion.span>
    );
  }
  if (state === "failed") {
    return <XCircle size={14} strokeWidth={2} className={cls} aria-hidden />;
  }
  return <CheckCircle2 size={14} strokeWidth={2} className={cls} aria-hidden />;
}

/** Badge statut relance — tokens Tarineo, label unique (pas de lettres éclatées). */
export function LandingStatusBadge({
  state = "pending",
  labels,
  className,
}: LandingStatusBadgeProps) {
  const label = { ...DEFAULT_LABELS, ...labels }[state];
  const cls = STATE_CLASSES[state];

  return (
    <span
      className={cn(
        "relative inline-flex h-8 items-center gap-1.5 overflow-hidden rounded-full border px-2.5 text-xs font-semibold tracking-tight",
        cls.wrap,
        className,
      )}
    >
      <span
        aria-hidden
        className={cn(
          "pointer-events-none absolute inset-x-[18%] top-0 h-px opacity-70",
          cls.glow,
        )}
      />

      <span className="relative flex size-3.5 shrink-0 items-center justify-center">
        <AnimatePresence mode="wait">
          <motion.span
            key={state}
            variants={ICON_VARIANTS}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="absolute flex items-center"
          >
            <StateIcon state={state} />
          </motion.span>
        </AnimatePresence>
      </span>

      <AnimatePresence mode="wait">
        <motion.span
          key={state}
          variants={LABEL_VARIANTS}
          initial="hidden"
          animate="visible"
          exit="exit"
          className="relative leading-none"
        >
          {label}
        </motion.span>
      </AnimatePresence>
    </span>
  );
}
