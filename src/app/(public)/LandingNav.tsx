"use client";

import { useEffect, useRef, useState } from "react";

const LIENS = [
  { href: "/#comment-ca-marche", label: "Comment ça marche", underline: true },
  { href: "/#fonctionnalites", label: "Fonctionnalités" },
  { href: "/#tarifs", label: "Tarifs" },
  { href: "/#contact", label: "Contact" },
];

export function LandingNav({ variant = "dark" }: { variant?: "dark" | "light" | "hero" }) {
  const [menuOuvert, setMenuOuvert] = useState(false);
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

  return (
    <div ref={racineRef} className="relative">
      <nav className={`hidden items-center gap-[50px] text-base sm:flex ${variant === "dark" ? "text-muted" : ""}`} aria-label="Navigation principale">
        {LIENS.map((lien) => (
          <a
            key={lien.href}
            href={lien.href}
            className={`landing-body ${lienClasse} ${lien.underline ? "underline underline-offset-4" : ""}`}
          >
            {lien.label}
          </a>
        ))}
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
          {LIENS.map((lien) => (
            <a
              key={lien.href}
              href={lien.href}
              onClick={() => setMenuOuvert(false)}
              className="landing-body block rounded-xl px-3 py-2.5 text-sm text-[var(--landing-text)] hover:bg-[var(--landing-chip)]"
            >
              {lien.label}
            </a>
          ))}
        </div>
      )}
    </div>
  );
}
