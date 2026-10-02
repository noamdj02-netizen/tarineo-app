"use client";

import { motion, useReducedMotion } from "framer-motion";
import { usePathname } from "next/navigation";
import { APPLE_SPRING } from "@/components/motion/reveal";

export function PageEnter({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const reduce = useReducedMotion();
  return (
    <motion.div
      key={pathname}
      className="w-full"
      initial={reduce ? false : { opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={reduce ? { duration: 0.2 } : APPLE_SPRING}
    >
      {children}
    </motion.div>
  );
}
