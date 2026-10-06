"use client";

import { useEffect, useState } from "react";

import { LandingHeaderNav } from "@/components/site/landing-v2/components/layout/LandingHeaderNav";
import { LandingMenuButton } from "@/components/site/landing-v2/components/layout/LandingMenuButton";
import { LandingNavDrawer } from "@/components/site/landing-v2/components/layout/LandingNavDrawer";
import { Logo } from "@/components/site/landing-v2/components/layout/Logo";
import { Button } from "@/components/site/landing-v2/components/ui/Button";
import { LANDING_LOGIN, LANDING_SIGNUP } from "@/lib/site/landing-v2-auth";
import { cn } from "@/lib/utils";

export function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const headerSurface = scrolled || menuOpen;

  return (
    <>
      <header
        className={cn(
          "fixed inset-x-0 top-0 z-50 transition-[background-color,border-color,box-shadow] duration-300 ease-out",
          headerSurface
            ? "border-b border-line bg-paper-100/90 shadow-[0_1px_0_rgb(10_10_10/0.04)] backdrop-blur-md"
            : "border-b border-transparent bg-transparent",
        )}
      >
        <div
          className={cn(
            "shell flex h-16 items-center sm:h-[72px]",
            "lg:grid lg:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] lg:items-center lg:gap-6",
          )}
        >
          <a
            href="#top"
            className="shrink-0 lg:justify-self-start"
            aria-label="Tarinéo — revenir en haut de la page"
          >
            <Logo />
          </a>

          <div className="hidden lg:flex lg:justify-self-center">
            <LandingHeaderNav />
          </div>

          <div className="ml-auto flex shrink-0 items-center gap-1 sm:gap-1.5 lg:ml-0 lg:justify-self-end">
            <div className="landing-header-actions hidden lg:inline-flex">
              <Button href={LANDING_LOGIN} variant="ghost" size="sm" className="px-3">
                Connexion
              </Button>
              <LandingMenuButton onClick={() => setMenuOpen(true)} open={menuOpen} />
              <Button
                href={LANDING_SIGNUP}
                size="sm"
                className="shadow-[0_4px_12px_-8px_rgb(120_58_32/0.3)]"
              >
                Commencer
              </Button>
            </div>

            <div className="flex items-center gap-1 sm:gap-1.5 lg:hidden">
              <Button
                href={LANDING_LOGIN}
                variant="ghost"
                size="sm"
                className="hidden px-2.5 sm:inline-flex"
              >
                Connexion
              </Button>
              <LandingMenuButton onClick={() => setMenuOpen(true)} open={menuOpen} />
              <span aria-hidden className="mx-0.5 hidden h-6 w-px bg-line sm:mx-1 sm:block" />
              <Button
                href={LANDING_SIGNUP}
                size="sm"
                className="hidden shadow-[0_4px_12px_-8px_rgb(120_58_32/0.3)] sm:inline-flex"
              >
                Commencer
              </Button>
            </div>
          </div>
        </div>
      </header>

      <LandingNavDrawer open={menuOpen} onClose={() => setMenuOpen(false)} />
    </>
  );
}
