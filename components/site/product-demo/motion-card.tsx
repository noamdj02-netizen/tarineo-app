"use client";

import { motion, useReducedMotion, type HTMLMotionProps } from "framer-motion";
import type { ReactNode } from "react";
import { PRODUCT_SPRING, PRODUCT_SPRING_FAST } from "@/lib/site/product-demo";
import { cn } from "@/lib/utils";

/** Entrée discrète — opacity + léger Y, pas de lift hover léger (trop « template »). */
export function MotionCard({
  children,
  className,
  delay = 0,
  hover = false,
  ...props
}: HTMLMotionProps<"div"> & { delay?: number; hover?: boolean }) {
  const reduce = useReducedMotion();

  return (
    <motion.div
      initial={reduce ? false : { opacity: 0, y: 10 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      whileHover={
        reduce || !hover
          ? undefined
          : { y: -2, transition: { duration: 0.18, ease: [0.2, 0.8, 0.2, 1] } }
      }
      transition={reduce ? { duration: 0.15 } : { ...PRODUCT_SPRING_FAST, delay }}
      className={cn(
        "rounded-[12px] border border-[rgba(10,10,10,0.08)] bg-[#FFFFFF]",
        className,
      )}
      {...props}
    >
      {children}
    </motion.div>
  );
}

export function StaggerItem({
  children,
  index = 0,
  className,
}: {
  children: ReactNode;
  index?: number;
  className?: string;
}) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      initial={reduce ? false : { opacity: 0, y: 8 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={
        reduce ? { duration: 0.12 } : { duration: 0.22, ease: [0.2, 0.8, 0.2, 1], delay: index * 0.04 }
      }
      className={className}
    >
      {children}
    </motion.div>
  );
}

export function ActionBar({
  value,
  className,
  color = "#16A34A",
  delay = 0.1,
}: {
  value: number;
  className?: string;
  color?: string;
  delay?: number;
}) {
  const reduce = useReducedMotion();
  return (
    <div className={cn("h-1.5 overflow-hidden rounded-full bg-[#F5F5F3]", className)}>
      <motion.div
        initial={reduce ? false : { width: 0 }}
        whileInView={{ width: `${Math.min(100, Math.max(0, value))}%` }}
        viewport={{ once: true }}
        transition={reduce ? { duration: 0.12 } : { ...PRODUCT_SPRING, delay }}
        className="h-full rounded-full"
        style={{ background: color }}
      />
    </div>
  );
}
