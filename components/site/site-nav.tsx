"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ArrowUpRight, Menu, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { APPLE_SPRING_FAST } from "@/components/motion/reveal";
import { LandingButton } from "@/components/site/landing-button";
import { SiteLogo } from "@/components/site/site-logo";
import { Button, buttonVariants } from "@/components/ui/button";
import { isBlogPath } from "@/lib/site/is-blog-path";
import { NAV_LINKS } from "@/lib/site/tarineo";
import { cn } from "@/lib/utils";

/**
 * Nav site public — verre clair sur la landing ; sombre sur les heroes foncés (avis / prix).
 */
export function SiteNav() {
  const pathname = usePathname();
  const reduce = useReducedMotion();
  const [scrolled, setScrolled] = useState(false);
  const isHome = pathname === "/";
  const isBlog = isBlogPath(pathname);
  const [overHero, setOverHero] = useState(
    pathname === "/avis" || pathname === "/prix",
  );
  const [open, setOpen] = useState(false);
  const light =
    isBlog ||
    ((pathname === "/avis" || pathname === "/prix") && !(overHero && !open));

  /**
   * La nav reste en verre sombre tant que le hero foncé affleure sous elle (avis / prix).
   * Le rect est relu à chaque scroll : la hauteur du hero bouge après
   * l’hydratation (scène animée, polices), une mesure gardée en mémoire serait fausse.
   * La nav vient du layout, le hero du segment de page : il peut manquer au montage,
   * on boucle en rAF jusqu’à le trouver.
   */
  useEffect(() => {
    let frame = 0;
    const update = () => {
      setScrolled(window.scrollY > 8);
      if (pathname !== "/avis" && pathname !== "/prix") {
        setOverHero(false);
        return;
      }
      const hero = document.getElementById("top");
      if (hero) setOverHero(hero.getBoundingClientRect().bottom > 88);
      else frame = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, [pathname]);

  useEffect(() => setOpen(false), [pathname]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  if (isHome) return null;

  return (
    <header className={cn("sticky top-0 z-40 px-3 pt-3 sm:px-6", light && "theme-light")}>
      <nav
        aria-label="Site"
        className={cn(
          "site-nav-bar mx-auto flex max-w-[1120px] items-center justify-between gap-3 rounded-pill border px-2.5 py-2 pl-4 transition-[background-color,border-color,box-shadow] duration-300 ease-out sm:gap-4 sm:px-3 sm:pl-5",
          light
            ? cn("site-nav-bar--light", (scrolled || open) && "site-nav-bar--light-scrolled")
            : cn("site-nav-bar--dark", (scrolled || open) && "site-nav-bar--dark-scrolled"),
        )}
      >
        <SiteLogo
          className="shrink-0"
          imageClassName="size-8 sm:size-9"
          lightNav={light}
        />

        <ul className="hidden items-center gap-1 md:flex">
          {NAV_LINKS.map((l) => (
            <li key={l.href}>
              <Link
                href={l.href}
                prefetch={false}
                className={cn(
                  buttonVariants({ variant: "ghost", size: "sm" }),
                  "rounded-pill px-3.5",
                  light
                    ? "text-ink/80 hover:bg-ink/5 hover:text-ink"
                    : "text-white/90 hover:bg-white/10 hover:text-white",
                )}
              >
                {l.label}
              </Link>
            </li>
          ))}
        </ul>

        <div className="flex items-center gap-1.5 sm:gap-2">
          <LandingButton
            href="/login"
            variant="navGhost"
            className={cn(
              "hidden lg:inline-flex",
              light
                ? "text-ink/75 hover:bg-ink/5 hover:text-ink"
                : "text-white/90 hover:bg-white/10 hover:text-white",
            )}
          >
            Connexion
          </LandingButton>
          <LandingButton
            href="/inscription"
            variant="navOrange"
            icon={<ArrowUpRight aria-hidden />}
            className="px-3.5 text-[13.5px] sm:px-4 sm:text-[14px]"
          >
            <span className="sm:hidden">Commencer</span>
            <span className="hidden sm:inline">Commencer gratuitement</span>
          </LandingButton>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => setOpen((o) => !o)}
            aria-expanded={open}
            aria-controls="site-mobile-menu"
            aria-label={open ? "Fermer le menu" : "Ouvrir le menu"}
            className={cn(
              "rounded-pill md:hidden",
              light ? "text-ink hover:bg-ink/6" : "text-white hover:bg-white/10",
            )}
          >
            {open ? <X aria-hidden /> : <Menu aria-hidden />}
          </Button>
        </div>
      </nav>

      <AnimatePresence>
        {open ? (
          <motion.div
            id="site-mobile-menu"
            initial={reduce ? { opacity: 0 } : { opacity: 0, y: -8, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={reduce ? { opacity: 0 } : { opacity: 0, y: -6, scale: 0.98 }}
            transition={reduce ? { duration: 0.2 } : APPLE_SPRING_FAST}
            className={cn(
              "mx-auto mt-2 max-w-[1120px] rounded-[22px] border p-2 shadow-[0_8px_30px_rgba(10,10,10,0.08)] backdrop-blur-xl md:hidden",
              light
                ? "site-nav-drawer--light"
                : "border-line bg-[#0c0c0c]/95",
            )}
          >
            {NAV_LINKS.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                prefetch={false}
                onClick={() => setOpen(false)}
                className={cn(
                  buttonVariants({ variant: "ghost", size: "lg" }),
                  "h-12 w-full justify-start rounded-[14px] px-4 text-[15px]",
                  light ? "text-ink hover:bg-ink/4" : "text-white/85 hover:bg-white/8",
                )}
              >
                {l.label}
              </Link>
            ))}
            <div
              className={cn(
                "mt-2 flex flex-col gap-2 border-t px-2 pt-3 pb-1",
                light ? "border-line/80" : "border-line",
              )}
            >
              <LandingButton href="/inscription" variant="orange" icon={<ArrowUpRight aria-hidden />} fullWidth>
                Commencer gratuitement
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
