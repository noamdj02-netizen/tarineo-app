"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Check, type LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import { POP_CHECK, POP_MARK, POP_PANEL, popTextTransition } from "@/components/motion/pop";
import { cn } from "@/lib/utils";

const SIZES = {
  sm: { box: "size-14", icon: "size-7", title: "text-[17px]", pad: "px-4 py-6" },
  md: { box: "size-[88px]", icon: "size-10", title: "text-[22px]", pad: "px-6 py-12" },
  lg: { box: "size-[104px]", icon: "size-12", title: "text-[26px]", pad: "px-8 py-14" },
} as const;

export type SuccessPopSize = keyof typeof SIZES;

/** Marque seule (cercle orange + check en Pop in). */
export function SuccessPopMark({
  size = "md",
  icon: Icon = Check,
  className,
}: {
  size?: SuccessPopSize;
  icon?: LucideIcon;
  className?: string;
}) {
  const reduce = useReducedMotion();
  const s = SIZES[size];

  return (
    <motion.div
      initial={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.55 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={reduce ? { duration: 0.15 } : POP_MARK}
      className={cn(
        "grid place-items-center rounded-full bg-tarineo-orange text-white shadow-[0_12px_32px_rgba(255,107,26,0.35)]",
        s.box,
        className,
      )}
    >
      <motion.span
        initial={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.4 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={reduce ? { duration: 0.12 } : POP_CHECK}
      >
        <Icon className={s.icon} strokeWidth={2.6} aria-hidden />
      </motion.span>
    </motion.div>
  );
}

/**
 * Validation Pop in — référence produit (Relances, onboarding, landing, post-import).
 * Cercle → check (stagger) → titre → hint → action.
 */
export function SuccessPop({
  title,
  hint,
  action,
  size = "md",
  titleId,
  className,
  children,
}: {
  title: string;
  hint?: string;
  action?: ReactNode;
  size?: SuccessPopSize;
  titleId?: string;
  className?: string;
  children?: ReactNode;
}) {
  const reduce = useReducedMotion();
  const s = SIZES[size];

  return (
    <motion.div
      role="status"
      aria-live="polite"
      initial={reduce ? { opacity: 0 } : { opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className={cn("flex flex-col items-center text-center", s.pad, className)}
    >
      <SuccessPopMark size={size} />
      <motion.p
        id={titleId}
        initial={reduce ? { opacity: 0 } : { opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={popTextTransition(0.18, reduce)}
        className={cn("mt-6 font-display font-semibold tracking-tight text-ink", s.title)}
      >
        {title}
      </motion.p>
      {hint ? (
        <motion.p
          initial={reduce ? { opacity: 0 } : { opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={popTextTransition(0.26, reduce)}
          className="mt-2 max-w-[32ch] text-[14px] text-muted-foreground"
        >
          {hint}
        </motion.p>
      ) : null}
      {children ? (
        <motion.div
          initial={reduce ? { opacity: 0 } : { opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={popTextTransition(0.3, reduce)}
          className="mt-4 w-full"
        >
          {children}
        </motion.div>
      ) : null}
      {action ? (
        <motion.div
          initial={reduce ? { opacity: 0 } : { opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={popTextTransition(0.34, reduce)}
          className="mt-8 flex flex-wrap items-center justify-center gap-2"
        >
          {action}
        </motion.div>
      ) : null}
    </motion.div>
  );
}

/** Overlay plein écran / carte — Pop in panel + SuccessPop. */
export function SuccessPopOverlay({
  open,
  title,
  hint,
  action,
  onDismiss,
  size = "md",
}: {
  open: boolean;
  title: string;
  hint?: string;
  action?: ReactNode;
  onDismiss?: () => void;
  size?: SuccessPopSize;
}) {
  const reduce = useReducedMotion();

  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          key="success-pop-overlay"
          className="fixed inset-0 z-[60] flex items-end justify-center bg-ink/25 p-0 sm:items-center sm:p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18 }}
          onClick={onDismiss}
        >
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="success-pop-title"
            initial={reduce ? { opacity: 0 } : { opacity: 0, y: 16, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={reduce ? { opacity: 0 } : { opacity: 0, y: 8, scale: 0.98 }}
            transition={reduce ? { duration: 0.15 } : POP_PANEL}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-[400px] overflow-hidden rounded-t-[20px] border border-line bg-surface shadow-lift sm:rounded-[20px]"
          >
            <SuccessPop
              titleId="success-pop-title"
              title={title}
              hint={hint}
              action={action}
              size={size}
            />
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
