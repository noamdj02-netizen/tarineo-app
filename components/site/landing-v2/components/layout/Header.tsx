"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

import { LandingMenuButton } from "@/components/site/landing-v2/components/layout/LandingMenuButton";
import { LandingNavDrawer } from "@/components/site/landing-v2/components/layout/LandingNavDrawer";
import {
  LandingNavMenu,
  LandingWipeLink,
} from "@/components/site/landing-v2/components/ui/LandingNavMenu";
import { LANDING_LOGIN, LANDING_SIGNUP } from "@/lib/site/landing-v2-auth";
import { marketingNavItems } from "@/lib/site/marketing-nav";
import { cn } from "@/lib/utils";

const ASSET = "/illustrations/landing-hero-24";

/**
 * Header marketing — même langage que le Hero landing
 * (logo app, liens plats, S’inscrire + Connexion).
 */
export function Header() {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const [desktopNav, setDesktopNav] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 1024px)");
    const sync = () => setDesktopNav(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => setMenuOpen(false), [pathname]);

  const items = marketingNavItems(pathname);

  return (
    <>
      <header
        className={cn(
          "sticky top-0 z-50 border-b bg-paper-100/92 text-ink-700 backdrop-blur-md transition-[border-color,box-shadow] duration-300",
          scrolled ? "border-line shadow-[0_8px_24px_rgba(97,44,0,0.06)]" : "border-line",
        )}
      >
        <div className="relative mx-auto flex w-full max-w-[1440px] items-center justify-between px-5 py-[18px] sm:px-10 lg:px-[100px]">
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
              items={items}
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

      <LandingNavDrawer open={menuOpen} onClose={() => setMenuOpen(false)} />
    </>
  );
}
