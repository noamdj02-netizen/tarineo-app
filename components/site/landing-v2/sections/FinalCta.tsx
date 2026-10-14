"use client";

import Image from "next/image";
import { motion, useReducedMotion } from "framer-motion";

import { LandingButton } from "@/components/site/landing-button";
import { LANDING_EASE, LANDING_VIEW } from "@/components/site/landing-v2/lib/landing-motion";
import { LANDING_SIGNUP } from "@/lib/site/landing-v2-auth";
import { sectionCta } from "@/lib/site/landing-v2-content";
import { BRAND } from "@/lib/brand";
import { cn } from "@/lib/utils";

/** CTA final photo chantier — Figma 235:34983 */
export function FinalCtaCard({ className }: { className?: string }) {
  const reduce = useReducedMotion();

  return (
    <motion.div
      className={cn(
        "relative overflow-hidden rounded-[32px]",
        "shadow-[0_2px_4px_rgba(97,44,0,0.04),0_8px_16px_rgba(97,44,0,0.06),0_24px_40px_rgba(156,156,156,0.1)]",
        className,
      )}
      initial={reduce ? { opacity: 0 } : { opacity: 0, y: 16 }}
      whileInView={reduce ? { opacity: 1 } : { opacity: 1, y: 0 }}
      viewport={LANDING_VIEW}
      transition={{ duration: 0.5, ease: LANDING_EASE }}
    >
      <div className="absolute inset-0 overflow-hidden" aria-hidden>
        <Image
          src={sectionCta.background}
          alt=""
          fill
          className="object-cover object-center scale-[1.35] sm:scale-[1.2] sm:object-[center_30%]"
          sizes="(max-width: 1200px) 100vw, 1200px"
          priority={false}
        />
        <div className="absolute inset-0 bg-black/45" aria-hidden />
      </div>

      <div
        className="relative z-10 flex min-h-[280px] flex-col items-center justify-center gap-6 px-5 py-14 sm:min-h-[322px] sm:gap-[30px] sm:px-10 sm:py-16"
      >
        <div className="flex max-w-[834px] flex-col items-center gap-4 text-center">
          <span className="inline-flex rounded-full bg-white px-[14px] py-2 text-sm font-semibold text-[#0a0a0a]">
            {sectionCta.badge}
          </span>
          <h2 className="text-[clamp(1.375rem,3.2vw,2rem)] font-bold leading-[1.2] text-white">
            {sectionCta.title}
          </h2>
          <p className="max-w-[52rem] text-base font-normal leading-normal text-[#ddd]">
            {sectionCta.subtitle}
          </p>
        </div>

        <div className="flex min-h-[72px] flex-wrap items-center justify-center gap-4">
          <LandingButton href={LANDING_SIGNUP} variant="primary" className="min-h-12 px-6">
            {sectionCta.primaryLabel}
          </LandingButton>
          <LandingButton
            href={`mailto:${BRAND.contactEmail}`}
            variant="orange"
            className="min-h-12 px-6"
          >
            {sectionCta.secondaryLabel}
          </LandingButton>
        </div>
      </div>
    </motion.div>
  );
}

export function FinalCta() {
  return (
    <section id="contact" className="pb-20 sm:pb-28">
      <div className="shell">
        <FinalCtaCard />
      </div>
    </section>
  );
}
