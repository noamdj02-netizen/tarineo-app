"use client";
import { useEffect, useState } from "react";

import { LANDING_LOGIN, LANDING_SIGNUP } from "@/lib/site/landing-v2-auth";
import { nav } from "@/lib/site/landing-v2-content";
import { Button } from "@/components/site/landing-v2/components/ui/Button";
import { Logo } from "@/components/site/landing-v2/components/layout/Logo";

export function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-[background-color,border-color,box-shadow] duration-300 ease-out ${
        scrolled || open
          ? "border-b border-line bg-paper-100/85 backdrop-blur-md"
          : "border-b border-transparent bg-transparent"
      }`}
    >
      <div className="shell flex h-16 items-center justify-between gap-6 sm:h-[72px]">
        <a href="#top" className="shrink-0" aria-label="Tarinéo — revenir en haut de la page">
          <Logo />
        </a>

        <nav aria-label="Navigation principale" className="hidden items-center gap-0.5 lg:flex">
          {nav.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="rounded-full px-3.5 py-2 text-sm text-ink-600 transition-colors duration-200 hover:bg-paper-0 hover:text-ink-900"
            >
              {item.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <Button href={LANDING_LOGIN} variant="ghost" className="max-sm:hidden px-3">
            Connexion
          </Button>
          <Button href={LANDING_SIGNUP} className="max-sm:hidden">
            Commencer avec Tarinéo
          </Button>
          <Button href={LANDING_SIGNUP} className="sm:hidden">
            Commencer
          </Button>

          <button
            type="button"
            aria-expanded={open}
            aria-controls="nav-mobile"
            aria-label={open ? "Fermer le menu" : "Ouvrir le menu"}
            onClick={() => setOpen((value) => !value)}
            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-line bg-paper-0 text-ink-900 lg:hidden"
          >
            <svg viewBox="0 0 20 20" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" aria-hidden="true">
              {open ? <path d="M5 5l10 10M15 5L5 15" /> : <path d="M3.5 6.5h13M3.5 10h13M3.5 13.5h13" />}
            </svg>
          </button>
        </div>
      </div>

      {open ? (
        <div id="nav-mobile" className="border-t border-line bg-paper-100/95 backdrop-blur-md lg:hidden">
          <nav aria-label="Navigation mobile" className="shell flex flex-col py-3">
            {nav.map((item) => (
              <a
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className="rounded-md px-2 py-3 text-[0.9375rem] text-ink-600 transition-colors hover:bg-paper-0 hover:text-ink-900"
              >
                {item.label}
              </a>
            ))}
            <a
              href={LANDING_LOGIN}
              onClick={() => setOpen(false)}
              className="rounded-md px-2 py-3 text-[0.9375rem] font-medium text-ink-900 transition-colors hover:bg-paper-0"
            >
              Connexion
            </a>
            <a
              href={LANDING_SIGNUP}
              onClick={() => setOpen(false)}
              className="rounded-md px-2 py-3 text-[0.9375rem] font-medium text-accent-700 transition-colors hover:bg-paper-0"
            >
              Créer un compte
            </a>
          </nav>
        </div>
      ) : null}
    </header>
  );
}
