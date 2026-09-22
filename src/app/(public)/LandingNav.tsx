"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { ChevronDownIcon } from "lucide-react";
import { NAV_LANDING_PRINCIPAL, NAV_LANDING_PRODUIT } from "@/lib/landingNavigation";
import { cn } from "@/lib/utils";

export function LandingNav({ variant = "dark" }: { variant?: "dark" | "light" | "hero" }) {
  const [menuOuvert, setMenuOuvert] = useState(false);
  const [produitOuvert, setProduitOuvert] = useState(false);
  const racineRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!menuOuvert) return;

    function surClicExterieur(e: MouseEvent) {
      if (racineRef.current && !racineRef.current.contains(e.target as Node)) {
        setMenuOuvert(false);
      }
    }
    function surEchap(e: KeyboardEvent) {
      if (e.key === "Escape") setMenuOuvert(false);
    }
    document.addEventListener("mousedown", surClicExterieur);
    document.addEventListener("keydown", surEchap);
    return () => {
      document.removeEventListener("mousedown", surClicExterieur);
      document.removeEventListener("keydown", surEchap);
    };
  }, [menuOuvert]);

  const lienClasse =
    variant === "dark"
      ? "hover:text-foreground"
      : "text-[var(--landing-text)] hover:text-[var(--landing-text)]";

  const liensSansFonctionnalites = NAV_LANDING_PRINCIPAL.filter((l) => l.id !== "fonctionnalites");
  const lienFonctionnalites = NAV_LANDING_PRINCIPAL.find((l) => l.id === "fonctionnalites")!;

  return (
    <div ref={racineRef} className="relative">
      <nav
        className={`hidden items-center gap-8 text-base xl:gap-[50px] sm:flex ${variant === "dark" ? "text-muted" : ""}`}
        aria-label="Navigation principale"
      >
        {liensSansFonctionnalites.slice(0, 1).map((lien) => (
          <Link key={lien.id} href={lien.hrefLanding} className={`landing-body ${lienClasse} underline underline-offset-4`}>
            {lien.label}
          </Link>
        ))}

        <div
          className="relative"
          onMouseEnter={() => setProduitOuvert(true)}
          onMouseLeave={() => setProduitOuvert(false)}
        >
          <div className="flex items-center gap-1">
            <Link href={lienFonctionnalites.hrefLanding} className={`landing-body ${lienClasse}`}>
              {lienFonctionnalites.label}
            </Link>
            <button
              type="button"
              aria-expanded={produitOuvert}
              aria-haspopup="true"
              aria-label="Voir les pages du produit"
              onClick={() => setProduitOuvert((o) => !o)}
              className={cn("rounded p-0.5", lienClasse)}
            >
              <ChevronDownIcon className={cn("size-4 transition-transform", produitOuvert && "rotate-180")} />
            </button>
          </div>

          {produitOuvert && (
            <div
              className="absolute left-1/2 top-full z-30 mt-3 w-[min(100vw-2rem,320px)] -translate-x-1/2 rounded-2xl border border-black/10 bg-white p-2 shadow-[0_12px_32px_rgba(0,0,0,0.12)]"
              role="menu"
            >
              {NAV_LANDING_PRODUIT.map((item) => (
                <Link
                  key={item.id}
                  href={item.hrefApp}
                  role="menuitem"
                  className="block rounded-xl px-3 py-2.5 transition-colors hover:bg-[var(--landing-chip)]"
                  onClick={() => setProduitOuvert(false)}
                >
                  <span className="landing-body block text-sm font-medium text-[var(--landing-text)]">{item.label}</span>
                  {item.description && (
                    <span className="landing-body mt-0.5 block text-xs text-[var(--landing-muted)]">{item.description}</span>
                  )}
                </Link>
              ))}
            </div>
          )}
        </div>

        {liensSansFonctionnalites.slice(1).map((lien) =>
          lien.hrefApp.startsWith("mailto:") ? (
            <a key={lien.id} href={lien.hrefApp} className={`landing-body ${lienClasse}`}>
              {lien.label}
            </a>
          ) : (
            <Link key={lien.id} href={lien.hrefLanding} className={`landing-body ${lienClasse}`}>
              {lien.label}
            </Link>
          )
        )}
      </nav>

      <button
        type="button"
        onClick={() => setMenuOuvert((o) => !o)}
        aria-expanded={menuOuvert}
        aria-controls="landing-nav-menu"
        aria-label={menuOuvert ? "Fermer le menu de navigation" : "Ouvrir le menu de navigation"}
        className="flex h-9 w-9 items-center justify-center rounded-md border border-black/10 text-[var(--landing-text)] hover:border-black/20 sm:hidden"
      >
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} width={18} height={18} aria-hidden="true">
          {menuOuvert ? <path d="M6 6l12 12M18 6L6 18" /> : <path d="M4 7h16M4 12h16M4 17h16" />}
        </svg>
      </button>

      {menuOuvert && (
        <div
          id="landing-nav-menu"
          className="fixed inset-x-4 top-[5.5rem] z-20 max-h-[75vh] overflow-y-auto rounded-2xl border border-black/10 bg-white p-2 shadow-[0_12px_32px_rgba(0,0,0,0.12)] sm:hidden"
        >
          {NAV_LANDING_PRINCIPAL.map((lien) =>
            lien.hrefApp.startsWith("mailto:") ? (
              <a
                key={lien.id}
                href={lien.hrefApp}
                onClick={() => setMenuOuvert(false)}
                className="landing-body block rounded-xl px-3 py-2.5 text-sm text-[var(--landing-text)] hover:bg-[var(--landing-chip)]"
              >
                {lien.label}
              </a>
            ) : (
              <Link
                key={lien.id}
                href={lien.hrefLanding}
                onClick={() => setMenuOuvert(false)}
                className="landing-body block rounded-xl px-3 py-2.5 text-sm text-[var(--landing-text)] hover:bg-[var(--landing-chip)]"
              >
                {lien.label}
              </Link>
            )
          )}
          <p className="landing-body px-3 pt-3 pb-1 text-xs font-semibold uppercase tracking-wide text-[var(--landing-muted)]">
            Dans l&apos;application
          </p>
          {NAV_LANDING_PRODUIT.map((item) => (
            <Link
              key={item.id}
              href={item.hrefApp}
              onClick={() => setMenuOuvert(false)}
              className="landing-body block rounded-xl px-3 py-2.5 text-sm text-[var(--landing-text)] hover:bg-[var(--landing-chip)]"
            >
              {item.label}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
