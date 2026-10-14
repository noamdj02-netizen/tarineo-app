"use client";

import { usePathname } from "next/navigation";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowUpRight, Mail } from "lucide-react";
import Link from "next/link";
import { APPLE_SPRING, APPLE_SPRING_FAST } from "@/components/motion/reveal";
import { InView } from "@/components/site/in-view";
import { LandingButton } from "@/components/site/landing-button";
import { SiteLogo } from "@/components/site/site-logo";
import { Separator } from "@/components/ui/separator";
import { FooterBrandWordmark } from "@/components/site/footer-brand-wordmark";
import { BRAND } from "@/lib/brand";
import { isMarketingLightPath } from "@/lib/site/is-marketing-light-path";
import { CTA_TRIAL, FINAL_CTA, FOOTER_COLS } from "@/lib/site/tarineo";
import { cn } from "@/lib/utils";

/** Usage : `<SiteFooter />` dans `app/(site)/layout.tsx`. */



const rise = {
  hidden: { opacity: 0, y: 12, scale: 0.985 },
  show: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: APPLE_SPRING,
  },
} as const;

const riseQuiet = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { duration: 0.2 } },
} as const;

export function SiteFooter() {
  const pathname = usePathname();
  const reduce = useReducedMotion();
  const variants = reduce ? riseQuiet : rise;
  const year = new Date().getFullYear();
  const isLightFooter = isMarketingLightPath(pathname);
  const wordmarkTone = isLightFooter ? "on-light" : "on-dark";

  if (pathname === "/") return null;

  return (
    <footer
      className={cn(
        "px-4 pt-4 pb-8 sm:px-8 sm:pt-6 sm:pb-10",
        isLightFooter ? "border-t border-line bg-paper-0" : "bg-bg",
      )}
    >
      <InView className="mx-auto max-w-[1080px]" stagger={0.1}>
        <div className="grid gap-4 lg:grid-cols-[minmax(0,0.92fr)_minmax(0,1.18fr)] lg:gap-5">
          <motion.article
            variants={variants}
            whileHover={reduce ? undefined : { y: -2 }}
            transition={APPLE_SPRING_FAST}
            className={cn(
              "relative isolate flex h-full min-h-[280px] flex-col overflow-hidden rounded-[22px] border border-line px-6 py-7 text-white shadow-lift sm:min-h-[300px] sm:rounded-[28px] sm:px-8 sm:py-8",
              isLightFooter ? "bg-ink-900" : "bg-surface",
            )}
          >
            <div
              aria-hidden
              className="pointer-events-none absolute inset-x-0 top-0 h-32 bg-[linear-gradient(180deg,rgba(255,255,255,0.05)_0%,transparent_100%)]"
            />
            <div
              aria-hidden
              className="pointer-events-none absolute -right-[18%] -bottom-[20%] h-[70%] w-[70%] rounded-full bg-[radial-gradient(closest-side,rgba(236,88,33,0.18),transparent_72%)] blur-3xl"
            />

            <div className="relative flex flex-1 flex-col gap-5">
              <SiteLogo
                priority={false}
                onDark
                className="relative z-[1] w-fit"
              />
              <p className="max-w-[28ch] text-[17px] leading-snug font-medium tracking-[-0.03em] text-balance text-white/90 sm:text-[19px]">
                {BRAND.tagline}
              </p>
              <LandingButton
                href={FINAL_CTA.href}
                variant="orange"
                icon={<ArrowUpRight aria-hidden />}
                className="w-fit"
              >
                {CTA_TRIAL.short}
              </LandingButton>
            </div>

            <div className="relative mt-8 flex flex-col gap-2 sm:mt-10">
              <a
                href={`mailto:${BRAND.contactEmail}`}
                className="inline-flex w-fit items-center gap-2 font-mono text-[13px] text-white/75 transition-colors duration-300 ease-out-soft hover:text-white"
              >
                <Mail className="size-3.5" aria-hidden />
                {BRAND.contactEmail}
              </a>
              <p className="font-mono text-[12px] tracking-[0.08em] text-white/75 uppercase">
                © {year} {BRAND.name} · Fait en France
              </p>
            </div>
          </motion.article>

          <motion.article
            variants={variants}
            whileHover={reduce ? undefined : { y: -2 }}
            transition={APPLE_SPRING_FAST}
            className={cn(
              "h-full rounded-[22px] border border-line px-6 py-7 shadow-soft ring-1 ring-line sm:rounded-[28px] sm:px-8 sm:py-8",
              isLightFooter ? "bg-paper-50" : "bg-surface",
            )}
          >
            <p className="mono-label mb-5">{`/ Aller plus loin ///`}</p>
            <div className="grid grid-cols-2 gap-x-6 gap-y-8 sm:grid-cols-3 sm:gap-x-4">
              {FOOTER_COLS.map((col) => (
                <div key={col.title}>
                  <p
                    className={cn(
                      "mb-3 font-mono text-[11px] font-medium tracking-[0.14em] uppercase",
                      isLightFooter ? "text-ink-400" : "text-muted-foreground",
                    )}
                  >
                    {col.title}
                  </p>
                  <ul className="flex flex-col gap-2">
                    {col.links.map((l) => (
                      <li key={l.href}>
                        <Link
                          href={l.href}
                          className={cn(
                            "group inline-flex items-center gap-1 text-[15px] transition-[color,transform] duration-300 ease-out-soft",
                            isLightFooter
                              ? "text-ink-600 hover:text-ink-900"
                              : "text-white/75 hover:text-white",
                          )}
                        >
                          {l.label}
                          <ArrowUpRight
                            aria-hidden
                            className="size-3 opacity-0 transition-[opacity,transform] duration-300 ease-out-soft group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:opacity-60"
                          />
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </motion.article>
        </div>

        <Separator className="mt-6 bg-line sm:mt-8" />

        <motion.div variants={variants} className="mt-6 sm:mt-8">
          <FooterBrandWordmark tone={wordmarkTone} />
        </motion.div>
      </InView>
    </footer>
  );
}
