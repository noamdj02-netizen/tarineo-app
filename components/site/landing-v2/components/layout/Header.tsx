"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { LandingHeaderNav } from "@/components/site/landing-v2/components/layout/LandingHeaderNav";
import { LandingMenuButton } from "@/components/site/landing-v2/components/layout/LandingMenuButton";
import { LandingNavDrawer } from "@/components/site/landing-v2/components/layout/LandingNavDrawer";
import { Logo } from "@/components/site/landing-v2/components/layout/Logo";
import { LandingFlipCta } from "@/components/site/landing-v2/components/ui/LandingFlipCta";
import { LANDING_LOGIN, LANDING_SIGNUP } from "@/lib/site/landing-v2-auth";
import { cn } from "@/lib/utils";

export function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [megaOpen, setMegaOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const elevated = scrolled || menuOpen || megaOpen;

  return (
    <>
      <header className="pointer-events-none fixed inset-x-0 top-0 z-50 pt-3 sm:pt-4">
        <div className="shell">
          <div
            data-landing-header-shell
            className={cn(
              "landing-header-bar pointer-events-auto relative flex h-14 items-center gap-3 border px-3 sm:h-[3.75rem] sm:gap-4 sm:px-4",
              megaOpen
                ? "rounded-t-2xl rounded-b-none border-b-transparent"
                : "rounded-2xl",
              elevated ? "landing-header-bar-elevated" : "landing-header-bar-top",
            )}
          >
            <Link
              href="/"
              className="shrink-0 rounded-lg outline-none focus-visible:ring-2 focus-visible:ring-accent/45"
              aria-label="Tarineo — accueil"
            >
              <Logo markClassName="h-8 w-8 sm:h-9 sm:w-9" />
            </Link>

            <div className="hidden min-w-0 flex-1 justify-center lg:flex">
              <LandingHeaderNav onMenuOpenChange={setMegaOpen} />
            </div>

            <div className="ml-auto flex shrink-0 items-center gap-1 sm:gap-2">
              <LandingFlipCta
                href={LANDING_LOGIN}
                label="Connexion"
                variant="ghost"
                size="sm"
                className="hidden px-3 md:inline-flex"
              />

              <LandingFlipCta
                href={LANDING_SIGNUP}
                label="Essayer"
                variant="ink"
                size="sm"
                className="min-[420px]:hidden"
              />
              <LandingFlipCta
                href={LANDING_SIGNUP}
                label="Commencer"
                variant="ink"
                size="sm"
                className="hidden min-[420px]:inline-flex"
              />

              <LandingMenuButton
                className="lg:hidden"
                onClick={() => setMenuOpen((open) => !open)}
                open={menuOpen}
              />
            </div>
          </div>
        </div>
      </header>

      <LandingNavDrawer open={menuOpen} onClose={() => setMenuOpen(false)} />
    </>
  );
}
