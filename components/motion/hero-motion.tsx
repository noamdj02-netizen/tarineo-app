"use client";

import {
  FileSearch,
  FolderTree,
  TrendingUp,
} from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";
import { FluidChip, FluidIcon } from "@/components/motion/fluid-icon";
import { APPLE_SPRING } from "@/components/motion/reveal";
import { cn } from "@/lib/utils";

const SIGNALS = [
  { icon: FileSearch, label: "Devis IA", delay: 0.05 },
  { icon: TrendingUp, label: "Hausses", delay: 0.12 },
  { icon: FolderTree, label: "Chantiers", delay: 0.19 },
] as const;

/**
 * Bande de signaux produit sous le hero — icônes fluides, une entrée orchestrée.
 */
export function HeroMotionSignals({ className }: { className?: string }) {
  const reduce = useReducedMotion();

  return (
    <motion.div
      initial={reduce ? false : { opacity: 0, y: 14 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.4 }}
      transition={reduce ? { duration: 0.2 } : APPLE_SPRING}
      className={cn(
        "flex flex-wrap items-center justify-center gap-2.5 sm:gap-3",
        className,
      )}
    >
      {SIGNALS.map((s) => (
        <FluidChip key={s.label} icon={s.icon} delay={reduce ? 0 : s.delay}>
          {s.label}
        </FluidChip>
      ))}
    </motion.div>
  );
}

/** Rangée d’icônes détaillées (sections produit) — stagger spring. */
export function MotionIconRow({
  items,
  className,
}: {
  items: { icon: (typeof SIGNALS)[number]["icon"]; label: string }[];
  className?: string;
}) {
  return (
    <ul className={cn("flex flex-wrap justify-center gap-4 sm:gap-6", className)}>
      {items.map((item, i) => (
        <li key={item.label}>
          <FluidIcon icon={item.icon} label={item.label} delay={i * 0.06} size="md" />
        </li>
      ))}
    </ul>
  );
}
