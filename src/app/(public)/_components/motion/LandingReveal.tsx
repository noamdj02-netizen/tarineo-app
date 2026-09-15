"use client";

import { motion, useReducedMotion, type TargetAndTransition } from "motion/react";
import type { ReactNode } from "react";
import { landingEase, landingSpringSoft } from "./landingMotionConfig";

type Variant = "up" | "left" | "right" | "scale" | "fade";

const hidden: Record<Variant, TargetAndTransition> = {
  up: { opacity: 0, y: 32 },
  left: { opacity: 0, x: -28 },
  right: { opacity: 0, x: 28 },
  scale: { opacity: 0, scale: 0.96 },
  fade: { opacity: 0 },
};

interface Props {
  children: ReactNode;
  className?: string;
  variant?: Variant;
  delay?: number;
  /** Déclenchement au scroll (défaut) ou au montage (hero). */
  once?: boolean;
  inView?: boolean;
}

export function LandingReveal({
  children,
  className = "",
  variant = "up",
  delay = 0,
  once = true,
  inView = true,
}: Props) {
  const reduce = useReducedMotion();

  if (reduce) {
    return <div className={className}>{children}</div>;
  }

  const visible: TargetAndTransition = { opacity: 1, x: 0, y: 0, scale: 1 };

  if (!inView) {
    return (
      <motion.div
        className={className}
        initial={hidden[variant]}
        animate={visible}
        transition={{ ...landingSpringSoft, delay: delay / 1000 }}
      >
        {children}
      </motion.div>
    );
  }

  return (
    <motion.div
      className={className}
      initial={hidden[variant]}
      whileInView={visible}
      viewport={{ once, amount: 0.2, margin: "0px 0px -40px 0px" }}
      transition={{ ...landingSpringSoft, delay: delay / 1000, ease: landingEase }}
    >
      {children}
    </motion.div>
  );
}
