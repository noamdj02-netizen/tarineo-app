"use client";

import { Menu, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { BRAND } from "@/lib/brand";
import { cn } from "@/lib/utils";

const LINKS = [
  { href: "/#fonctions", label: "Fonctions" },
  { href: "/#comment", label: "Comment ça marche" },
  { href: "/prix", label: "Prix" },
  { href: "/#faq", label: "FAQ" },
];

/** Barre du site public : pilule centrée qui se détache au scroll. */
export function SiteNav() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => setOpen(false), [pathname]);

  return (
    <header className="sticky top-0 z-40 px-3 pt-3 sm:px-6">
      <nav
        aria-label="Site"
        className={cn(
          "mx-auto flex max-w-[1120px] items-center justify-between gap-4 rounded-pill border px-3 py-2 pl-5 transition-[background-color,border-color,box-shadow] duration-300 ease-out-soft",
          scrolled || open
            ? "border-line bg-surface/85 shadow-soft backdrop-blur-xl"
            : "border-transparent bg-transparent",
        )}
      >
        <Link
          href="/"
          className="font-grotesk text-[22px] leading-none font-bold tracking-[-0.04em]"
          aria-label={`${BRAND.name}, page d'accueil`}
        >
          {BRAND.name}
          <span className="text-accent-2">.</span>
        </Link>

        <ul className="hidden items-center gap-1 md:flex">
          {LINKS.map((l) => (
            <li key={l.href}>
              <Link
                href={l.href}
                className="rounded-pill px-3.5 py-2 text-[14px] text-ink/70 transition-colors hover:bg-accent-soft hover:text-ink"
              >
                {l.label}
              </Link>
            </li>
          ))}
        </ul>

        <div className="flex items-center gap-2">
          <Link
            href="/login"
            className="hidden min-h-10 items-center rounded-pill px-4 text-[14px] font-medium text-ink/80 hover:text-ink sm:inline-flex"
          >
            Connexion
          </Link>
          <Link
            href="/inscription"
            className="btn-dark inline-flex min-h-10 items-center rounded-pill px-4 text-[14px] font-medium"
          >
            Commencer
          </Link>
          <button
            type="button"
            onClick={() => setOpen((o) => !o)}
            aria-expanded={open}
            aria-label={open ? "Fermer le menu" : "Ouvrir le menu"}
            className="grid size-10 place-items-center rounded-pill hover:bg-accent-soft md:hidden"
          >
            {open ? <X className="size-5" aria-hidden /> : <Menu className="size-5" aria-hidden />}
          </button>
        </div>
      </nav>

      {open ? (
        <div className="mx-auto mt-2 max-w-[1120px] rounded-[22px] border border-line bg-surface p-2 shadow-lift md:hidden">
          {[...LINKS, { href: "/login", label: "Connexion" }].map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="flex min-h-12 items-center rounded-[14px] px-4 text-[15px] hover:bg-accent-soft"
            >
              {l.label}
            </Link>
          ))}
        </div>
      ) : null}
    </header>
  );
}
