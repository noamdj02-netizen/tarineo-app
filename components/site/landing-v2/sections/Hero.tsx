"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { useEffect, useState } from "react";

import { HeroFigmaCircuits } from "@/components/site/landing-v2/sections/HeroFigmaCircuits";
import { HeroFigmaDecor } from "@/components/site/landing-v2/sections/HeroFigmaDecor";
import { LandingButton } from "@/components/site/landing-button";
import { LandingMenuButton } from "@/components/site/landing-v2/components/layout/LandingMenuButton";
import { LandingNavDrawer } from "@/components/site/landing-v2/components/layout/LandingNavDrawer";
import { HeroFeatureCards } from "@/components/site/landing-v2/sections/HeroFeatureCards";
import { LandingNavMenu } from "@/components/site/landing-v2/components/ui/LandingNavMenu";
import { LANDING_LOGIN, LANDING_SIGNUP } from "@/lib/site/landing-v2-auth";
import { heroDesigns28 } from "@/lib/site/landing-v2-content";
import { scrollToLaunchContactForm } from "@/lib/site/launch-offer";
import { marketingNavItems } from "@/lib/site/marketing-nav";
import { HERO, OFFER } from "@/lib/site/tarineo";
import { cn } from "@/lib/utils";

const AVATARS = [
  "/landing/figma/avatar-1.jpg",
  "/landing/figma/avatar-2.jpg",
  "/landing/figma/avatar-3.jpg",
] as const;

const navBtn =
  "inline-flex min-h-11 items-center justify-center rounded-xl px-5 text-base font-medium shadow-[0_4px_4px_rgba(0,0,0,0.25)]";

/**
 * Figma node `235:33214` — hero (circuits + 4 cartes, frame Designs-28).
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
      data-node-id="235:33214"
      data-name="hero"
      className="relative overflow-x-clip bg-[#f0f0f0] pb-8 text-[#262626] lg:pb-4"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.12]"
        style={{
          backgroundImage:
            "repeating-linear-gradient(135deg, transparent, transparent 12px, rgba(0,0,0,0.03) 12px, rgba(0,0,0,0.03) 13px)",
        }}
      />
      <div className="relative isolate mx-auto w-full min-w-0 max-w-[1440px] overflow-x-clip lg:min-h-[1050px]">
        <HeroFigmaDecor />
        <HeroFigmaCircuits />

      <header className="relative z-30">
        <div className="mx-auto flex w-full max-w-[1440px] items-center justify-between px-5 py-[18px] sm:px-10 lg:px-[100px]">
          <Link
            href="/"
            className={cn(
              "relative flex min-h-11 items-center gap-2.5 rounded-[11px] bg-white px-3 py-2",
              "shadow-[0_4px_4px_#f8d3d4,0_4px_4px_rgba(0,0,0,0.25)] outline-none focus-visible:ring-2 focus-visible:ring-[#ff642b]/45",
            )}
            aria-label="Tarineo — accueil"
          >
            <Image
              src="/landing/v2/tarineo-app-icon.png"
              alt=""
              width={36}
              height={36}
              className="size-9 rounded-[9px] object-cover"
              priority
            />
            <span className="text-[1.35rem] font-bold leading-none tracking-tight text-[#0a0a0a]">
              TARINEO
            </span>
          </Link>

          {desktopNav ? (
            <LandingNavMenu
              items={marketingNavItems("/")}
              className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-[14px] p-1 shadow-[0_4px_2px_rgba(0,0,0,0.25)]"
            />
          ) : null}

          <div className="flex items-center gap-2 sm:gap-3">
            {desktopNav ? (
              <>
                <Link
                  href={LANDING_SIGNUP}
                  className={cn(navBtn, "hidden border border-black/5 bg-white text-black sm:inline-flex")}
                >
                  S&apos;inscrire
                </Link>
                <Link
                  href={LANDING_LOGIN}
                  className={cn(
                    navBtn,
                    "bg-[#ff642b] text-white shadow-[inset_0_-4px_4px_0_#ff9880]",
                  )}
                >
                  Connexion
                </Link>
              </>
            ) : null}
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

      <div className="relative z-20 mx-auto flex w-full max-w-[900px] flex-col items-center px-5 pt-6 text-center sm:px-10 lg:max-w-[1406px] lg:px-12 lg:pt-2">
        <div
          data-node-id="235:34086"
          className={cn(
            "inline-flex max-w-full origin-top scale-[0.94] items-center justify-center gap-[4px] overflow-hidden rounded-[66px] border border-[#f4f4f4] bg-[#fcfcfc] py-[4px] pl-2 pr-[4px]",
            "shadow-[0_0_0_1px_#ffffff,0_4px_16px_rgba(176,176,176,0.08)]",
            "sm:scale-100 sm:gap-[5px] sm:py-[5px] sm:pl-2.5 sm:pr-[5px]",
          )}
        >
          <span className="flex shrink-0 -space-x-2">
            {AVATARS.map((src) => (
              <Image
                key={src}
                src={src}
                alt=""
                width={22}
                height={22}
                className="size-5 rounded-full border border-white object-cover sm:size-[22px]"
              />
            ))}
          </span>
          <span className="shrink-0 text-center text-xs font-medium leading-[18px] text-[#262626] sm:text-sm sm:leading-[21px]">
            Alertes prix · artisans BTP
          </span>
          <Link
            href={HERO.primary.href}
            className="inline-flex shrink-0 cursor-pointer items-center justify-center gap-[2px] rounded-[66px] bg-[#333] px-1.5 py-[4px] text-xs font-medium leading-[18px] text-white outline-none transition-colors hover:bg-[#444] focus-visible:ring-2 focus-visible:ring-[#ff642b]/45 sm:gap-[3px] sm:px-2 sm:py-[5px] sm:text-sm sm:leading-[21px]"
          >
            Importez un devis
            <ArrowRight className="size-3 shrink-0 sm:size-3.5" aria-hidden />
          </Link>
        </div>

        <h1 className="hero-display mt-6 text-balance text-[#262626] lg:mt-8">
          <span data-node-id="235:33481" className="block">
            {heroDesigns28.titleLine1}
          </span>
          <span className="block">{heroDesigns28.titleLine2}</span>
          <span
            data-node-id="235:33482"
            className="hero-title-mark block text-[#ff642b]"
          >
            {heroDesigns28.titleAccent}
          </span>
        </h1>

        <p
          data-node-id="235:33483"
          className="mx-auto mt-5 max-w-[648px] text-pretty text-base font-normal leading-relaxed text-[#4d4d4d] sm:text-lg"
        >
          {heroDesigns28.text}
        </p>

        <div className="mt-8 flex w-full max-w-xl flex-col gap-3 lg:hidden">
          <div className="flex w-full flex-col gap-3 sm:flex-row sm:justify-center">
            <LandingButton
              href={HERO.primary.href}
              variant="orange"
              fullWidth
              className="min-h-[60px] flex-1 rounded-xl bg-[#ff642b] text-base shadow-[0_4px_4px_rgba(0,0,0,0.25),inset_0_-4px_4px_0_#ff9880] sm:min-w-[280px] sm:flex-none"
            >
              {heroDesigns28.launchPrimaryCta}
            </LandingButton>
            <button
              type="button"
              onClick={scrollToLaunchContactForm}
              className="inline-flex min-h-[60px] w-full items-center justify-center rounded-xl border border-black/10 bg-white px-5 text-base font-medium text-[#262626] shadow-[0_4px_4px_rgba(0,0,0,0.12)] outline-none transition-colors hover:border-black/15 focus-visible:ring-2 focus-visible:ring-[#ff642b]/45 sm:w-auto sm:min-w-[200px]"
            >
              Nous contacter
            </button>
          </div>
          <p className="text-sm text-[#666]">{OFFER}</p>
          <p className="text-sm text-[#888]">{HERO.founderLine}</p>
        </div>
      </div>

      <div
        data-node-id="235:33486"
        className="pointer-events-none absolute left-1/2 top-[475px] z-30 hidden w-[min(447px,calc(100%-2.5rem))] -translate-x-1/2 flex-col gap-2.5 lg:pointer-events-auto lg:flex lg:flex-row lg:gap-2.5"
      >
        <LandingButton
          href={HERO.primary.href}
          variant="orange"
          className="min-h-[52px] max-w-[291px] flex-1 rounded-xl bg-[#ff642b] px-5 text-base shadow-[0_4px_4px_rgba(0,0,0,0.25),inset_0_-4px_4px_0_#ff9880]"
        >
          {heroDesigns28.launchPrimaryCta}
        </LandingButton>
        <button
          type="button"
          onClick={scrollToLaunchContactForm}
          className="inline-flex min-h-[52px] flex-1 items-center justify-center rounded-xl border border-black/10 bg-white px-4 text-base font-medium text-[#262626] shadow-[0_4px_4px_rgba(0,0,0,0.12)] outline-none transition-colors hover:border-black/15 focus-visible:ring-2 focus-visible:ring-[#ff642b]/45"
        >
          Nous contacter
        </button>
      </div>

      <p className="pointer-events-none absolute left-1/2 top-[889px] z-20 hidden w-full max-w-[541px] -translate-x-1/2 px-5 text-center text-sm text-[#666] lg:block">
        {OFFER}
      </p>

      <HeroFeatureCards />
      </div>
    </section>
  );
}
