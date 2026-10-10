"use client";

import { AnimatePresence, motion, useMotionValue, useReducedMotion, useSpring } from "framer-motion";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";

import { LANDING_PRIMARY_CTA_LABEL, LANDING_SIGNUP } from "@/lib/site/landing-v2-auth";
import { cn } from "@/lib/utils";

function Eye({
  smirk,
  side,
  reduce,
}: {
  smirk: boolean;
  side: "left" | "right";
  reduce: boolean | null;
}) {
  const eyeRef = useRef<HTMLDivElement>(null);
  const pupilX = useMotionValue(0);
  const pupilY = useMotionValue(0);
  const springX = useSpring(pupilX, { stiffness: 300, damping: 22 });
  const springY = useSpring(pupilY, { stiffness: 300, damping: 22 });

  useEffect(() => {
    if (reduce) return;
    const onMove = (e: MouseEvent) => {
      const el = eyeRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const angle = Math.atan2(e.clientY - cy, e.clientX - cx);
      const distance = Math.min(5, Math.hypot(e.clientX - cx, e.clientY - cy) / 14);
      pupilX.set(Math.cos(angle) * distance);
      pupilY.set(Math.sin(angle) * distance);
    };
    window.addEventListener("mousemove", onMove, { passive: true });
    return () => window.removeEventListener("mousemove", onMove);
  }, [pupilX, pupilY, reduce]);

  return (
    <motion.div
      ref={eyeRef}
      animate={
        smirk
          ? { scaleY: 0.42, rotate: side === "left" ? -4 : 4 }
          : { scaleY: 1, rotate: 0 }
      }
      transition={{ type: "spring", stiffness: 260, damping: 18 }}
      className="relative flex size-[34px] items-center justify-center overflow-hidden rounded-full bg-white shadow-inner sm:size-[38px]"
      aria-hidden
    >
      <motion.div
        style={reduce ? undefined : { x: springX, y: springY }}
        animate={{
          y: smirk ? 2 : 0,
          scaleX: smirk ? 0.55 : 1,
          scaleY: smirk ? 1.55 : 1,
          backgroundColor: smirk ? "#ff6b1a" : "#0a0a0a",
        }}
        transition={{ type: "spring", stiffness: 260, damping: 20 }}
        className="absolute size-[12px] rounded-full sm:size-[14px]"
      />
      <motion.div
        initial={false}
        animate={{
          height: smirk ? 20 : 0,
          rotate: smirk ? (side === "left" ? 14 : -14) : 0,
        }}
        transition={{ type: "spring", stiffness: 260, damping: 22 }}
        className="pointer-events-none absolute -top-1.5 -right-2 -left-2 bg-[#0a0a0a]"
        style={{ transformOrigin: side === "left" ? "top right" : "top left" }}
      />
    </motion.div>
  );
}

/** CTA hero — yeux qui suivent le curseur, clin d’œil orange au survol. */
export function GooglyEyesCta({
  href = LANDING_SIGNUP,
  label = LANDING_PRIMARY_CTA_LABEL,
  activeLabel = "C’est parti !",
  className,
}: {
  href?: string;
  label?: string;
  activeLabel?: string;
  className?: string;
}) {
  const reduce = useReducedMotion();
  const [hot, setHot] = useState(false);

  return (
    <motion.div
      whileHover={reduce ? undefined : { scale: 1.02 }}
      whileTap={reduce ? undefined : { scale: 0.96 }}
      transition={{ duration: 0.15, ease: "easeOut" }}
      className={cn("inline-flex", className)}
    >
      <Link
        href={href}
        onMouseEnter={() => setHot(true)}
        onMouseLeave={() => setHot(false)}
        onFocus={() => setHot(true)}
        onBlur={() => setHot(false)}
        className="landing-cta-glow relative inline-flex min-h-12 touch-manipulation select-none items-center gap-3 rounded-full border border-transparent bg-accent py-2.5 pr-3 pl-5 text-white shadow-[0_16px_40px_-18px_rgba(10,10,10,0.55)] outline-none transition-[color,background-color] duration-150 ease-out hover:bg-accent-hover focus-visible:ring-2 focus-visible:ring-accent/50 focus-visible:ring-offset-2 focus-visible:ring-offset-paper-100 active:bg-accent-active sm:pl-6"
        style={{ WebkitTapHighlightColor: "transparent" }}
      >
        <span className="relative h-5 min-w-[11.5rem] overflow-hidden sm:min-w-[13.5rem]">
          <AnimatePresence mode="wait" initial={false}>
            <motion.span
              key={hot ? "hot" : "idle"}
              initial={
                reduce ? false : { opacity: 0, y: 12, filter: "blur(4px)" }
              }
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              exit={
                reduce
                  ? { opacity: 0 }
                  : { opacity: 0, y: -12, filter: "blur(4px)", transition: { duration: 0.15, ease: "easeOut" } }
              }
              transition={{ duration: 0.3, ease: "easeOut" }}
              className="absolute inset-0 flex items-center text-[0.9375rem] font-semibold tracking-tight whitespace-nowrap"
            >
              {hot ? activeLabel : label}
            </motion.span>
          </AnimatePresence>
        </span>
        <span className="flex items-center gap-1.5">
          <Eye smirk={hot} side="left" reduce={reduce} />
          <Eye smirk={hot} side="right" reduce={reduce} />
        </span>
      </Link>
    </motion.div>
  );
}
