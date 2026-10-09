"use client";

import { motion, useReducedMotion } from "framer-motion";
import { usePathname } from "next/navigation";
import { POP_PAGE } from "@/components/motion/pop";

/** Entrée app par pathname — même Pop in que `components/motion/page-enter`. */
export function PageEnter({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const reduce = useReducedMotion();
  return (
    <motion.div
      key={pathname}
      className="w-full"
      initial={reduce ? false : { opacity: 0, y: 10, scale: 0.985 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={reduce ? { duration: 0.2 } : POP_PAGE}
    >
      {children}
    </motion.div>
  );
}
