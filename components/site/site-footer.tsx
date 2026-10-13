"use client";

import { motion, useReducedMotion } from "framer-motion";
import Link from "next/link";
import { EASE } from "@/components/motion/reveal";
import { InView } from "@/components/site/in-view";
import { BRAND } from "@/lib/brand";
import { FOOTER, FOOTER_COLS } from "@/lib/site/tarineo";
import { cn } from "@/lib/utils";

const rise = {
  hidden: { opacity: 0, y: 14 },
  show: { opacity: 1, y: 0, transition: { duration: 0.55, ease: EASE } },
} as const;

export function SiteFooter() {
  const reduce = useReducedMotion();
  const year = new Date().getFullYear();

  return (
    <footer className="relative isolate overflow-hidden px-4 pt-16 pb-0 sm:px-8">
      <div
        aria-hidden
        className="absolute inset-0 -z-10 bg-cover bg-center"
        style={{ backgroundImage: "url(/landing/figma/footer-chantier.jpg)" }}
      />
      <div aria-hidden className="absolute inset-0 -z-10 bg-[linear-gradient(180deg,rgba(20,16,14,0.92)_0%,rgba(20,16,14,0.55)_42%,rgba(20,16,14,0.2)_100%)]" />

      <InView className="mx-auto max-w-[1180px] text-white" stagger={0.08}>
        <div className="grid gap-10 pb-10 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)]">
          <motion.div variants={reduce ? undefined : rise}>
            <p className="font-display text-[32px] font-semibold tracking-tight">{BRAND.name.toUpperCase()}</p>
            <p className="mt-4 max-w-[42ch] text-[16px] leading-relaxed text-white/85">{FOOTER.blurb}</p>
            <a
              href={`mailto:${BRAND.contactEmail}`}
              className="mt-3 inline-block text-[16px] underline underline-offset-4"
            >
              {BRAND.contactEmail}
            </a>
          </motion.div>

          <motion.div variants={reduce ? undefined : rise} className="grid grid-cols-3 gap-4 sm:gap-8">
            {FOOTER_COLS.map((col) => (
              <div key={col.title}>
                <p className="mb-3 text-[14px] font-semibold text-brand-orange">{col.title}</p>
                <ul className="flex flex-col gap-2">
                  {col.links.map((l) => (
                    <li key={l.href}>
                      <Link href={l.href} className="text-[14px] text-white/85 transition-colors hover:text-white">
                        {l.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </motion.div>
        </div>

        <motion.div
          variants={reduce ? undefined : rise}
          className="flex flex-col gap-2 border-t border-white/15 py-5 text-[13px] text-white/80 sm:flex-row sm:items-center sm:justify-between"
        >
          <p>
            © {year} {BRAND.name}. {FOOTER.legal}
          </p>
          <p>{FOOTER.site}</p>
        </motion.div>

        <motion.p
          aria-hidden
          variants={reduce ? undefined : rise}
          className={cn(
            "select-none text-center font-display text-[clamp(4.5rem,18vw,11rem)] leading-[0.78] font-semibold tracking-tightest text-white/55",
            "[mask-image:linear-gradient(180deg,black_12%,transparent_92%)]",
          )}
        >
          TARINEO
        </motion.p>
      </InView>
    </footer>
  );
}
