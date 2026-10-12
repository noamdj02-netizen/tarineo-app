"use client";

import { motion, useReducedMotion } from "framer-motion";

import { cn } from "@/lib/utils";

const HERO_ASSET = "/illustrations/landing-hero-24";

/** Fond orange hero (gradient + texture) — réutilisé panneau téléphone et visuels landing. */
export function LandingHeroOrangeBackdrop({ className }: { className?: string }) {
  const reduce = useReducedMotion();

  return (
    <div className={cn("pointer-events-none absolute inset-0 overflow-hidden", className)} aria-hidden>
      {!reduce ? (
        <>
          <motion.div
            className="absolute inset-0 bg-gradient-to-b from-[#ffc4b0] via-[#f7562c] to-[#e8451f]"
            animate={{ opacity: [0.35, 0.75, 0.35] }}
            transition={{ duration: 7, ease: "easeInOut", repeat: Infinity }}
          />
          <motion.div
            className="absolute -left-1/4 top-[-20%] h-[70%] w-[150%] rounded-full bg-[radial-gradient(ellipse_at_center,rgba(255,255,255,0.35)_0%,transparent_65%)]"
            animate={{ x: ["-8%", "12%", "-8%"], y: ["0%", "10%", "0%"], opacity: [0.4, 0.7, 0.4] }}
            transition={{ duration: 9, ease: "easeInOut", repeat: Infinity }}
          />
          <motion.div
            className="absolute -right-1/4 bottom-[10%] h-[55%] w-[120%] rounded-full bg-[radial-gradient(ellipse_at_center,rgba(255,140,80,0.55)_0%,transparent_70%)]"
            animate={{ x: ["10%", "-14%", "10%"], y: ["8%", "-6%", "8%"], opacity: [0.45, 0.8, 0.45] }}
            transition={{ duration: 11, ease: "easeInOut", repeat: Infinity }}
          />
          <motion.div
            className="absolute inset-x-0 top-[-20%] h-[120%] bg-gradient-to-b from-[#faad98]/80 to-transparent"
            animate={{ y: [-24, 32, -24], opacity: [0.25, 0.55, 0.25] }}
            transition={{ duration: 8, ease: "easeInOut", repeat: Infinity }}
          />
        </>
      ) : null}
      <motion.div
        className="absolute inset-0 bg-repeat opacity-90"
        style={{
          backgroundImage: `url(${HERO_ASSET}/orange-texture.png)`,
          backgroundSize: "600px 600px",
        }}
        animate={
          reduce
            ? undefined
            : {
                backgroundPosition: ["0px 0px", "48px 32px", "0px 0px"],
                scale: [1, 1.04, 1],
              }
        }
        transition={reduce ? undefined : { duration: 18, ease: "linear", repeat: Infinity }}
      />
    </div>
  );
}
