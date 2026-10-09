"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { LandingHeaderNav } from "@/components/site/landing-v2/components/layout/LandingHeaderNav";
import { LandingMenuButton } from "@/components/site/landing-v2/components/layout/LandingMenuButton";
import { LandingNavDrawer } from "@/components/site/landing-v2/components/layout/LandingNavDrawer";
import { Logo } from "@/components/site/landing-v2/components/layout/Logo";
import { Button } from "@/components/site/landing-v2/components/ui/Button";
import { LANDING_LOGIN, LANDING_PRIMARY_CTA_LABEL, LANDING_SIGNUP } from "@/lib/site/landing-v2-auth";
import { cn } from "@/lib/utils";

export function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const elevated = scrolled || menuOpen;

  return (
    <>
      <header className="pointer-events-none fixed inset-x-0 top-0 z-50 pt-3 sm:pt-4">
        <div className="shell">
          <div
            className={cn(
              "landing-header-bar pointer-events-auto flex h-14 items-center gap-3 rounded-2xl border px-3 sm:h-[3.75rem] sm:gap-4 sm:px-4",
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
              <LandingHeaderNav />
            </div>

            <div className="ml-auto flex shrink-0 items-center gap-1 sm:gap-2">
              <Button href={LANDING_LOGIN} variant="ghost" size="sm" className="hidden px-3 md:inline-flex">
                Connexion
              </Button>

              <Button
                href={LANDING_SIGNUP}
                size="sm"
                variant="primary"
                className={cn("max-w-[10.5rem] truncate sm:max-w-none", "landing-cta-glow")}
              >
                <span className="hidden min-[420px]:inline">{LANDING_PRIMARY_CTA_LABEL}</span>
                <span className="min-[420px]:hidden">Essayer</span>
              </Button>

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
