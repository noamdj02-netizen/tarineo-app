"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "motion/react";
import type { ComponentProps } from "react";

type Props = ComponentProps<typeof Link>;

/** Lien avec retour tactile — pour actions secondaires dans les listes. */
export function AppPressableLink({ className = "", children, ...props }: Props) {
  const reduce = useReducedMotion();

  if (reduce) {
    return (
      <Link className={className} {...props}>
        {children}
      </Link>
    );
  }

  return (
    <motion.div whileTap={{ scale: 0.98 }} className="inline-flex">
      <Link className={className} {...props}>
        {children}
      </Link>
    </motion.div>
  );
}
