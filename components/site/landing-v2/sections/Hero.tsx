"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { LandingMenuButton } from "@/components/site/landing-v2/components/layout/LandingMenuButton";
import { LandingNavDrawer } from "@/components/site/landing-v2/components/layout/LandingNavDrawer";
import { HeroPhonePanel } from "@/components/site/landing-v2/components/ui/HeroPhonePanel";
import {
  LandingNavMenu,
  LandingWipeLink,
} from "@/components/site/landing-v2/components/ui/LandingNavMenu";
import { TactileButton } from "@/components/site/landing-v2/components/ui/TactileButton";
import {
  LandingHeroStagger,
  LandingStaggerItem,
} from "@/components/site/landing-v2/lib/landing-motion";
import { PRO_TRIAL_DAYS } from "@/lib/billing/plans";
import { LANDING_LOGIN, LANDING_SIGNUP } from "@/lib/site/landing-v2-auth";
import { LAUNCH_FREE_MONTHS, scrollToLaunchContactForm } from "@/lib/site/launch-offer";
import { marketingNavItems } from "@/lib/site/marketing-nav";
import { KNOWN_SUPPLIERS } from "@/lib/metier/suppliers";
import { ALERT_THRESHOLD, HERO } from "@/lib/site/tarineo";

const ASSET = "/illustrations/landing-hero-24";

/** Preuves produit réelles — jamais de métriques inventées. */
const TRUST = [
  {
    value: `${PRO_TRIAL_DAYS}\u00a0jours`,
    label: "d’essai, sans carte",
    accent: false,
  },
  {
    value: `+${ALERT_THRESHOLD}\u00a0%`,
    label: "seuil d’alerte prix",
    accent: true,
  },
  {
    value: `${KNOWN_SUPPLIERS.length}`,
    label: "enseignes reconnues",
    accent: false,
  },
] as const;

/**
 * Figma « Hero Designs - 24 » — node 183:3794
 * Conversion Tarineo : CTA essai, confiance métier, nav FR.
 * Titre H1 inchangé.
 */
export function Hero() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [desktopNav, setDesktopNav] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 1024px)");
    const sync = () => setDesktopNav(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  return (
    <section
      id="top"
      data-node-id="183:3794"
      data-name="Hero Designs - 24"
      className="hero-designs-24 relative overflow-x-clip bg-paper-100 text-ink-700 lg:min-h-[848px]"
    >
      <header className="relative z-20 border-b border-line">
        <div className="mx-auto flex w-full max-w-[1440px] items-center justify-between px-5 py-[18px] sm:px-10 lg:px-[100px]">
          <Link
            href="/"
            className="relative flex min-h-11 items-center gap-2.5 rounded-lg outline-none focus-visible:ring-2 focus-visible:ring-accent/45"
            aria-label="Tarineo — accueil"
          >
            <Image
              src={`${ASSET}/logo-mark-app.png`}
              alt=""
              width={36}
              height={36}
              className="size-9 rounded-[9px] object-cover object-center"
              priority
            />
            <span className="text-[1.35rem] font-bold leading-[1.5] tracking-tight text-ink-900">
              Tarineo
            </span>
          </Link>

          {desktopNav ? (
            <LandingNavMenu
              items={marketingNavItems("/")}
              className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
            />
          ) : null}

          <div className="flex items-center gap-2 sm:gap-3">
            {desktopNav ? (
              <LandingWipeLink
                href={LANDING_SIGNUP}
                label="S'inscrire"
                className="min-h-11 rounded-full border border-ink-900/20 bg-gradient-to-t from-ink-900/5 to-ink-900/10 shadow-none"
                restClassName="text-ink-900"
              />
            ) : null}
            <LandingWipeLink
              href={LANDING_LOGIN}
              label="Connexion"
              className="min-h-11 rounded-md bg-ink-900 shadow-sm"
              restClassName="text-paper-0"
            />
            {!desktopNav ? (
              <LandingMenuButton
                open={menuOpen}
                onClick={() => setMenuOpen((open) => !open)}
              />
            ) : null}
          </div>
        </div>
      </header>

      {!desktopNav ? (
        <LandingNavDrawer open={menuOpen} onClose={() => setMenuOpen(false)} />
      ) : null}

      <div className="relative mx-auto grid w-full max-w-[1440px] items-start gap-8 px-5 pb-10 pt-4 sm:gap-10 sm:px-10 lg:min-h-[calc(848px-81px)] lg:grid-cols-1 lg:px-[100px] lg:pb-12 lg:pt-5">
        <LandingHeroStagger
          className="relative z-10 flex w-full max-w-[555px] flex-col gap-8 sm:gap-10 lg:mt-2 lg:gap-14 lg:py-2"
          stagger={0.08}
        >
          <div className="flex flex-col gap-8">
            <LandingStaggerItem className="flex flex-col gap-4">
              <div className="inline-flex h-9 w-fit items-center gap-2 rounded-full border border-black/[0.04] bg-paper-0 px-4 text-[13px] font-medium tracking-tight text-ink-800 shadow-[0_1px_0_rgba(0,0,0,0.04),0_2px_6px_rgba(0,0,0,0.04)]">
                <span className="size-1.5 shrink-0 rounded-full bg-[#f7562c]" aria-hidden />
                {HERO.badge}
              </div>

              <h1 className="hero-display">
                Vos fournisseurs augmentent leurs prix.
                <br />
                <span className="hero-title-mark">Vous le voyez ?</span>
              </h1>

              <p className="max-w-md text-pretty text-lg font-medium leading-relaxed text-ink-700">
                {HERO.text}
              </p>
            </LandingStaggerItem>

            <LandingStaggerItem className="flex flex-col gap-3">
              <div className="flex w-full flex-col gap-3 sm:flex-row sm:items-stretch sm:gap-3">
                <TactileButton
                  size="default"
                  indicatorColor="accent"
                  fullWidth
                  className="sm:w-auto sm:flex-1 sm:min-w-0"
                  onClick={scrollToLaunchContactForm}
                >
                  Rejoindre les 30 premiers artisans
                </TactileButton>
                <button
                  type="button"
                  onClick={scrollToLaunchContactForm}
                  className="inline-flex min-h-[52px] w-full items-center justify-center rounded-md border border-ink-900/20 bg-gradient-to-t from-ink-900/5 to-ink-900/10 px-5 text-base font-medium text-ink-900 shadow-none outline-none transition-colors hover:border-ink-900/30 focus-visible:ring-2 focus-visible:ring-accent/45 focus-visible:ring-offset-2 focus-visible:ring-offset-paper-100 sm:min-h-[60px] sm:w-auto sm:min-w-[176px]"
                >
                  Nous contacter
                </button>
              </div>
              <p className="text-sm text-ink-500">
                Offre de lancement&nbsp;: gratuit pendant {LAUNCH_FREE_MONTHS}&nbsp;mois pour les
                30&nbsp;premiers artisans.
              </p>
              <p className="text-sm text-ink-400">{HERO.founderLine}</p>
            </LandingStaggerItem>
          </div>

          <LandingStaggerItem className="w-full max-w-[520px] border-t border-line pt-5 sm:pt-6">
            <dl className="grid grid-cols-3 divide-x divide-line">
              {TRUST.map((item) => (
                <div
                  key={item.label}
                  className="flex min-w-0 flex-col gap-1 px-2.5 first:pl-0 last:pr-0 sm:gap-1.5 sm:px-5"
                >
                  <dt className="order-2 min-h-[2.4em] text-[11px] font-medium leading-snug text-ink-400 sm:min-h-0 sm:text-[13px]">
                    {item.label}
                  </dt>
                  <dd
                    className={
                      item.accent
                        ? "order-1 text-[1.125rem] font-semibold leading-none tracking-tight text-accent nums sm:text-[1.375rem]"
                        : "order-1 text-[1.125rem] font-semibold leading-none tracking-tight text-ink-900 nums sm:text-[1.375rem]"
                    }
                  >
                    {item.value}
                  </dd>
                </div>
              ))}
            </dl>
          </LandingStaggerItem>
        </LandingHeroStagger>

        <div className="relative z-0 -mx-1 flex w-[calc(100%+0.5rem)] justify-center overflow-hidden sm:mx-0 sm:w-full lg:absolute lg:right-0 lg:top-[22px] lg:w-[681px] lg:justify-end lg:overflow-visible">
          <HeroPhonePanel />
        </div>
      </div>
    </section>
  );
}
