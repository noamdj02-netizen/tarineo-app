"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Menu, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { EASE } from "@/components/motion/reveal";
import { LandingButton } from "@/components/site/landing-button";
import { SiteLogo } from "@/components/site/site-logo";
import { Button, buttonVariants } from "@/components/ui/button";
import { CTA_TRIAL, NAV_LINKS } from "@/lib/site/tarineo";
import { cn } from "@/lib/utils";

/** Nav Figma : logo à gauche, liens pilule au centre, essai orange à droite. */
export function SiteNav() {
  const pathname = usePathname();
  const reduce = useReducedMotion();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => setOpen(false), [pathname]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <header
      className={cn(
        "sticky top-0 z-40 px-3 pt-4 transition-colors duration-300 sm:px-6",
        scrolled || open ? "bg-bg/80 pb-3 backdrop-blur-xl" : "",
      )}
    >
      <nav
        aria-label="Site"
        className="mx-auto flex max-w-[1320px] items-center justify-between gap-3"
      >
        <SiteLogo
          className="shrink-0 rounded-pill border border-line bg-white px-3 py-1.5 shadow-soft"
          imageClassName="size-8 sm:size-9"
        />

        <ul className="hidden items-center gap-0.5 rounded-pill border border-line bg-white/90 p-1 shadow-soft backdrop-blur-xl md:flex">
          {NAV_LINKS.map((l, i) => (
            <li key={l.href}>
              <Link
                href={l.href}
                prefetch={false}
                className={cn(
                  buttonVariants({ variant: "ghost", size: "sm" }),
                  "rounded-pill px-4 text-[14px] text-ink hover:bg-surface-2",
                  i === 0 && "bg-surface-2",
                )}
              >
                {l.label}
              </Link>
            </li>
          ))}
        </ul>

        <div className="flex items-center gap-1.5 sm:gap-2">
          <LandingButton href="/login" variant="navGhost" className="hidden lg:inline-flex">
            Connexion
          </LandingButton>
          <LandingButton href="/inscription" variant="navOrange" className="px-4 text-[13.5px] sm:text-[14px]">
            {CTA_TRIAL.short}
          </LandingButton>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => setOpen((o) => !o)}
            aria-expanded={open}
            aria-controls="site-mobile-menu"
            aria-label={open ? "Fermer le menu" : "Ouvrir le menu"}
            className="rounded-pill text-ink hover:bg-white md:hidden"
          >
            {open ? <X aria-hidden /> : <Menu aria-hidden />}
          </Button>
        </div>
      </nav>

      <AnimatePresence>
        {open ? (
          <motion.div
            id="site-mobile-menu"
            initial={reduce ? { opacity: 0 } : { opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduce ? { opacity: 0 } : { opacity: 0, y: -6 }}
            transition={{ duration: 0.28, ease: EASE }}
            className="mx-auto mt-2 max-w-[1320px] rounded-[22px] border border-line bg-white p-2 shadow-lift md:hidden"
          >
            {NAV_LINKS.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                prefetch={false}
                onClick={() => setOpen(false)}
                className={cn(
                  buttonVariants({ variant: "ghost", size: "lg" }),
                  "h-12 w-full justify-start rounded-[14px] px-4 text-[15px] text-ink hover:bg-surface-2",
                )}
              >
                {l.label}
              </Link>
            ))}
            <div className="mt-2 flex flex-col gap-2 border-t border-line px-2 pt-3 pb-1">
              <LandingButton href="/inscription" variant="orange" fullWidth>
                {CTA_TRIAL.short}
              </LandingButton>
              <LandingButton href="/login" variant="pillWhite" fullWidth className="min-h-11">
                Connexion
              </LandingButton>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </header>
  );
}
