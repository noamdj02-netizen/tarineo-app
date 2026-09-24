"use client";

import type { CSSProperties } from "react";
import { motion, useReducedMotion } from "framer-motion";
import Image from "next/image";
import { EASE } from "@/components/motion/reveal";
import { brandLogoUrl } from "@/lib/resources/logo";
import { STACK_MARQUEE } from "@/lib/site/content";
import { cn } from "@/lib/utils";

function MarqueeItem({ label, domain }: { label: string; domain: string }) {
  const logo = brandLogoUrl(domain, 64);
  const reduce = useReducedMotion();

  return (
    <motion.span
      className="inline-flex shrink-0 items-center gap-2.5 rounded-pill border border-line bg-surface py-2 pr-4 pl-2.5 shadow-soft"
      whileHover={
        reduce
          ? undefined
          : {
              y: -2,
              scale: 1.03,
              transition: { type: "spring", stiffness: 420, damping: 22, mass: 0.6 },
            }
      }
    >
      {logo ? (
        <Image
          src={logo}
          alt=""
          width={28}
          height={28}
          className="size-7 rounded-md bg-surface-2 object-contain"
          unoptimized
        />
      ) : (
        <span
          className="grid size-7 place-items-center rounded-md bg-surface-2 font-mono text-[10px] font-bold text-ink/50"
          aria-hidden
        >
          {label.charAt(0)}
        </span>
      )}
      <span className="font-mono text-[11px] tracking-[0.04em] text-ink/75 uppercase">{label}</span>
    </motion.span>
  );
}

function MarqueeLane({ durationSec }: { durationSec: number }) {
  const items = [...STACK_MARQUEE, ...STACK_MARQUEE];

  return (
    <div className="relative overflow-hidden [mask-image:linear-gradient(90deg,transparent,black_6%,black_94%,transparent)]">
      <div
        className={cn(
          "flex w-max gap-3 px-3 will-change-transform motion-reduce:animate-none animate-marquee",
          "group-hover/marquee:[animation-play-state:paused]",
        )}
        style={{ "--marquee-duration": `${durationSec}s` } as CSSProperties}
      >
        {items.map((item, i) => (
          <MarqueeItem key={`${item.domain}-${i}`} label={item.label} domain={item.domain} />
        ))}
      </div>
    </div>
  );
}

/** Bandeau logos / outils défilant (logos via logo.dev). */
export function LandingMarquee({ className }: { className?: string }) {
  const reduce = useReducedMotion();

  return (
    <motion.section
      className={cn(
        "group/marquee w-[100vw] max-w-[100vw] bg-transparent py-5",
        "relative left-1/2 -translate-x-1/2",
        className,
      )}
      aria-label="Stack compatible"
      initial={reduce ? false : { opacity: 0, y: 18, filter: "blur(6px)" }}
      whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.65, ease: EASE }}
    >
      <motion.p
        className="mono-label mb-4 text-center"
        initial={reduce ? false : { opacity: 0, y: 8 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5, ease: EASE, delay: 0.08 }}
      >
        / Ta stack, déjà au bon endroit ///
      </motion.p>

      <MarqueeLane durationSec={52} />
    </motion.section>
  );
}
