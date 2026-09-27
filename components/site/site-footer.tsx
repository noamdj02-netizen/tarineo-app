"use client";

import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight, ArrowUpRight, Mail } from "lucide-react";
import Link from "next/link";
import { EASE } from "@/components/motion/reveal";
import { InView } from "@/components/site/in-view";
import { LandingButton } from "@/components/site/landing-button";
import { SiteLogo } from "@/components/site/site-logo";
import { Separator } from "@/components/ui/separator";
import { BRAND } from "@/lib/brand";
import { PRO_TRIAL_DAYS } from "@/lib/billing/plans";
import { cn } from "@/lib/utils";

/** Usage : `<SiteFooter />` dans `app/(site)/layout.tsx`. */

const COLS = [
  {
    title: "Produit",
    links: [
      { href: "/#solution", label: "Solution" },
      { href: "/#fonctions", label: "Fonctions" },
      { href: "/prix", label: "Prix" },
      { href: "/#faq", label: "FAQ" },
    ],
  },
  {
    title: "Parcours",
    links: [
      { href: "/#comment", label: "Comment ça marche" },
      { href: "/#film", label: "Téléphone" },
      { href: "/#temoignages", label: "Témoignages" },
    ],
  },
  {
    title: "Compte",
    links: [
      { href: "/inscription", label: "Créer un compte" },
      { href: "/login", label: "Connexion" },
      { href: "/mot-de-passe-oublie", label: "Mot de passe oublié" },
    ],
  },
  {
    title: "Légal",
    links: [
      { href: "/mentions-legales", label: "Mentions légales" },
      { href: "/cgv", label: "CGV / CGU" },
      { href: "/confidentialite", label: "Confidentialité" },
    ],
  },
] as const;

const rise = {
  hidden: { opacity: 0, y: 14, filter: "blur(6px)" },
  show: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { duration: 0.55, ease: EASE },
  },
} as const;

const riseQuiet = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { duration: 0.2 } },
} as const;

export function SiteFooter() {
  const reduce = useReducedMotion();
  const variants = reduce ? riseQuiet : rise;
  const year = new Date().getFullYear();

  return (
    <footer className="bg-bg px-4 pt-4 pb-[max(2rem,env(safe-area-inset-bottom))] sm:px-8 sm:pt-6 sm:pb-[max(2.5rem,env(safe-area-inset-bottom))]">
      <InView className="mx-auto max-w-[1080px]" stagger={0.1}>
        <div className="grid gap-4 lg:grid-cols-[minmax(0,0.92fr)_minmax(0,1.18fr)] lg:gap-5">
          <motion.article
            variants={variants}
            whileHover={reduce ? undefined : { y: -3 }}
            transition={{ duration: 0.35, ease: EASE }}
            className="relative isolate flex h-full min-h-[280px] flex-col overflow-hidden rounded-[22px] bg-ink px-6 py-7 text-accent-ink shadow-lift ring-1 ring-accent-ink/10 sm:min-h-[320px] sm:rounded-[28px] sm:px-8 sm:py-8"
          >
            <div
              aria-hidden
              className="pointer-events-none absolute inset-x-0 top-0 h-32 bg-[linear-gradient(180deg,rgba(255,255,255,0.12)_0%,transparent_100%)]"
            />
            <div
              aria-hidden
              className="pointer-events-none absolute -right-[18%] -bottom-[20%] h-[70%] w-[70%] rounded-full bg-[radial-gradient(closest-side,color-mix(in_srgb,var(--color-glow-2)_32%,transparent)_0%,transparent_72%)] blur-3xl"
            />

            <div className="relative flex flex-1 flex-col gap-5">
              <SiteLogo
                priority={false}
                onDark
                className="relative z-[1] w-fit"
                imageClassName="bg-surface"
              />
              <p className="max-w-[28ch] text-[17px] leading-snug font-medium tracking-[-0.03em] text-balance text-accent-ink/90 sm:text-[19px]">
                Le cockpit des fondateurs solo. Un projet en Focus, la prochaine
                action.
              </p>
              <LandingButton
                href="/inscription?plan=pro"
                variant="inverse"
                icon={<ArrowRight aria-hidden />}
                className="w-fit"
              >
                Essai gratuit {PRO_TRIAL_DAYS} jours
              </LandingButton>
            </div>

            <div className="relative mt-8 flex flex-col gap-2 sm:mt-10">
              <a
                href="mailto:contact@navpit.com"
                className="inline-flex w-fit items-center gap-2 font-mono text-[11.5px] text-accent-ink/55 transition-colors duration-300 ease-out-soft hover:text-accent-ink"
              >
                <Mail className="size-3.5" aria-hidden />
                contact@navpit.com
              </a>
              <p className="font-mono text-[11px] tracking-[0.08em] text-accent-ink/40 uppercase">
                © {year} {BRAND.name} · Fait en France
              </p>
            </div>
          </motion.article>

          <motion.article
            variants={variants}
            whileHover={reduce ? undefined : { y: -3 }}
            transition={{ duration: 0.35, ease: EASE }}
            className="h-full rounded-[22px] border border-line bg-surface px-6 py-7 shadow-soft ring-1 ring-line sm:rounded-[28px] sm:px-8 sm:py-8"
          >
            <p className="mono-label mb-5">{`/ Aller plus loin ///`}</p>
            <div className="grid grid-cols-2 gap-x-6 gap-y-8 sm:grid-cols-4 sm:gap-x-4">
              {COLS.map((col) => (
                <div key={col.title}>
                  <p className="mb-3 font-mono text-[11px] font-medium tracking-[0.14em] text-muted-foreground uppercase">
                    {col.title}
                  </p>
                  <ul className="flex flex-col gap-2">
                    {col.links.map((l) => (
                      <li key={l.href}>
                        <Link
                          href={l.href}
                          className="group inline-flex items-center gap-1 text-[13.5px] text-ink/70 transition-[color,transform] duration-300 ease-out-soft hover:text-ink"
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

        <motion.p
          aria-hidden
          variants={variants}
          className={cn(
            "mt-6 select-none text-center font-display text-[clamp(4.75rem,20vw,12.5rem)] leading-[0.78] font-semibold tracking-tightest text-ink/10 sm:mt-8",
            "[mask-image:linear-gradient(180deg,black_8%,transparent_88%)]",
          )}
        >
          {BRAND.name}
        </motion.p>
      </InView>
    </footer>
  );
}
