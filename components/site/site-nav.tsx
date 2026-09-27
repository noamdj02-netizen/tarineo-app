"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ArrowUpRight, Menu, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { EASE } from "@/components/motion/reveal";
import { LandingButton } from "@/components/site/landing-button";
import { SiteLogo } from "@/components/site/site-logo";
import { Button, buttonVariants } from "@/components/ui/button";
import { CTA_TRIAL, NAV_LINKS } from "@/lib/site/tarineo";
import { cn } from "@/lib/utils";

/** Barre du site public : pilule centrée, transparente sur le hero, verre sombre au scroll. */
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
    <header className="sticky top-0 z-40 px-3 pt-3 sm:px-6">
      <nav
        aria-label="Site"
        className={cn(
          "mx-auto flex max-w-[1120px] items-center justify-between gap-3 rounded-pill border px-2.5 py-2 pl-4 transition-[background-color,border-color,box-shadow] duration-300 ease-out-soft sm:gap-4 sm:px-3 sm:pl-5",
          scrolled || open
            ? "border-line bg-black/70 shadow-soft backdrop-blur-xl"
            : "liquid-glass border-white/15 bg-black/35",
        )}
      >
        <SiteLogo className="shrink-0" imageClassName="size-8 sm:size-9" />

        <ul className="hidden items-center gap-1 md:flex">
          {NAV_LINKS.map((l) => (
            <li key={l.href}>
              <Link
                href={l.href}
                prefetch={false}
                className={cn(
                  buttonVariants({ variant: "ghost", size: "sm" }),
                  "rounded-pill px-3.5 text-white/90 hover:bg-white/10 hover:text-white",
                )}
              >
                {l.label}
              </Link>
            </li>
          ))}
        </ul>

        <div className="flex items-center gap-1.5 sm:gap-2">
          <LandingButton href="/login" variant="navGhost" className="hidden text-white/90 hover:bg-white/10 hover:text-white lg:inline-flex">
            Connexion
          </LandingButton>
          <LandingButton
            href="/inscription"
            variant="navOrange"
            icon={<ArrowUpRight aria-hidden />}
            className="px-3.5 text-[13.5px] sm:px-4 sm:text-[14px]"
          >
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
            className="rounded-pill text-white hover:bg-white/10 md:hidden"
          >
            {open ? <X aria-hidden /> : <Menu aria-hidden />}
          </Button>
        </div>
      </nav>

      <AnimatePresence>
        {open ? (
          <motion.div
            id="site-mobile-menu"
            initial={reduce ? { opacity: 0 } : { opacity: 0, y: -8, filter: "blur(4px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            exit={reduce ? { opacity: 0 } : { opacity: 0, y: -6, filter: "blur(4px)" }}
            transition={{ duration: 0.28, ease: EASE }}
            className="mx-auto mt-2 max-w-[1120px] rounded-[22px] border border-line bg-[#0c0c0c]/95 p-2 shadow-lift backdrop-blur-xl md:hidden"
          >
            {NAV_LINKS.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                prefetch={false}
                onClick={() => setOpen(false)}
                className={cn(
                  buttonVariants({ variant: "ghost", size: "lg" }),
                  "h-12 w-full justify-start rounded-[14px] px-4 text-[15px] text-white/85 hover:bg-white/8",
                )}
              >
                {l.label}
              </Link>
            ))}
            <div className="mt-2 flex flex-col gap-2 border-t border-line px-2 pt-3 pb-1">
              <LandingButton href="/inscription" variant="orange" icon={<ArrowUpRight aria-hidden />} fullWidth>
                {CTA_TRIAL.short}
              </LandingButton>
              <LandingButton href="/login" variant="secondary" fullWidth className="min-h-11">
                Connexion
              </LandingButton>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </header>
  );
}
