"use client";

import { Menu, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { LandingButton } from "@/components/site/landing-button";
import { SiteLogo } from "@/components/site/site-logo";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const LINKS = [
  { href: "/#solution", label: "Solution" },
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
        <SiteLogo className="shrink-0" />

        <ul className="hidden items-center gap-1 md:flex">
          {LINKS.map((l) => (
            <li key={l.href}>
              <Button
                variant="ghost"
                size="sm"
                render={<Link href={l.href} prefetch={l.href.startsWith("/") && !l.href.includes("#")} />}
                className="rounded-pill px-3.5 text-muted-foreground hover:text-foreground"
              >
                {l.label}
              </Button>
            </li>
          ))}
        </ul>

        <div className="flex items-center gap-2">
          <LandingButton href="/login" variant="navGhost" className="hidden sm:inline-flex">
            Connexion
          </LandingButton>
          <LandingButton href="/#commencer" variant="navPrimary" className="hidden sm:inline-flex">
            Commencer
          </LandingButton>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => setOpen((o) => !o)}
            aria-expanded={open}
            aria-label={open ? "Fermer le menu" : "Ouvrir le menu"}
            className="rounded-pill md:hidden"
          >
            {open ? <X aria-hidden /> : <Menu aria-hidden />}
          </Button>
        </div>
      </nav>

      {open ? (
        <div className="mx-auto mt-2 max-w-[1120px] rounded-[22px] border border-line bg-surface p-2 shadow-lift md:hidden">
          {LINKS.map((l) => (
            <Button
              key={l.href}
              variant="ghost"
              size="lg"
              render={
                <Link href={l.href} prefetch={l.href.startsWith("/") && !l.href.includes("#")} />
              }
              className="h-12 w-full justify-start rounded-[14px] px-4 text-[15px]"
            >
              {l.label}
            </Button>
          ))}
          <div className="mt-2 flex flex-col gap-2 border-t border-line px-2 pt-3">
            <LandingButton href="/login" variant="secondary" fullWidth className="min-h-11">
              Connexion
            </LandingButton>
            <LandingButton href="/#commencer" variant="primary" fullWidth className="min-h-11">
              Commencer
            </LandingButton>
          </div>
        </div>
      ) : null}
    </header>
  );
}
