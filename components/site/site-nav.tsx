"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Menu, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { APPLE_SPRING_FAST } from "@/components/motion/reveal";
import { LandingNavMenu } from "@/components/site/landing-v2/components/ui/LandingNavMenu";
import { LandingButton } from "@/components/site/landing-button";
import { SiteLogo } from "@/components/site/site-logo";
import { Button, buttonVariants } from "@/components/ui/button";
import { isMarketingLightPath } from "@/lib/site/is-marketing-light-path";
import { LANDING_LOGIN, LANDING_SIGNUP } from "@/lib/site/landing-v2-auth";
import { marketingNavItems } from "@/lib/site/marketing-nav";
import { NAV_LINKS } from "@/lib/site/tarineo";
import { cn } from "@/lib/utils";

/**
 * Nav pages site (hors accueil). Sur le marketing clair : même liens que la landing Hero.
 */
export function SiteNav() {
  const pathname = usePathname();
  const reduce = useReducedMotion();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const isHome = pathname === "/";
  const light = isMarketingLightPath(pathname);
  const marketingItems = marketingNavItems(pathname);

  useEffect(() => {
    const update = () => setScrolled(window.scrollY > 8);
    update();
    window.addEventListener("scroll", update, { passive: true });
    return () => window.removeEventListener("scroll", update);
  }, []);

  useEffect(() => setOpen(false), [pathname]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  if (isHome) return null;

  return (
    <header
      className={cn(
        "sticky top-0 z-40 px-5 pt-[18px] sm:px-10 lg:px-[100px]",
        light && "theme-light",
      )}
    >
      <nav
        aria-label="Site"
        className={cn(
          "relative mx-auto flex w-full max-w-[1440px] items-center justify-between gap-3",
          !light &&
            "site-nav-bar rounded-pill border px-2.5 py-2 pl-4 transition-[background-color,border-color,box-shadow] duration-300 ease-out sm:gap-4 sm:px-3 sm:pl-5",
          !light &&
            cn(
              "site-nav-bar--dark",
              (scrolled || open) && "site-nav-bar--dark-scrolled",
            ),
        )}
      >
        {light ? (
          <Link
            href="/"
            className={cn(
              "relative flex min-h-11 shrink-0 items-center gap-2.5 rounded-[11px] bg-white px-3 py-2",
              "shadow-[0_4px_4px_#f8d3d4,0_4px_4px_rgba(0,0,0,0.25)] outline-none focus-visible:ring-2 focus-visible:ring-[#ff642b]/45",
            )}
            aria-label="Tarineo — accueil"
          >
            <Image
              src="/landing/v2/tarineo-app-icon.png"
              alt=""
              width={36}
              height={36}
              className="size-9 rounded-[9px] object-cover"
              priority
            />
            <span className="text-[1.35rem] font-bold leading-none tracking-tight text-[#0a0a0a]">
              TARINEO
            </span>
          </Link>
        ) : (
          <SiteLogo className="shrink-0" imageClassName="size-8 sm:size-9" lightNav={false} />
        )}

        {light ? (
          <div className="absolute left-1/2 top-1/2 hidden -translate-x-1/2 -translate-y-1/2 lg:block">
            <LandingNavMenu
              items={marketingItems}
              className="rounded-[14px] p-1 shadow-[0_4px_2px_rgba(0,0,0,0.25)]"
            />
          </div>
        ) : (
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
        )}

        <div className="flex items-center gap-2 sm:gap-3">
          {light ? (
            <>
              <Link
                href={LANDING_SIGNUP}
                className="hidden min-h-11 items-center justify-center rounded-xl border border-black/5 bg-white px-5 text-base font-medium text-black shadow-[0_4px_4px_rgba(0,0,0,0.25)] sm:inline-flex"
              >
                S&apos;inscrire
              </Link>
              <Link
                href={LANDING_LOGIN}
                className="inline-flex min-h-11 items-center justify-center rounded-xl bg-[#ff642b] px-5 text-base font-medium text-white shadow-[inset_0_-4px_4px_0_#ff9880]"
              >
                Connexion
              </Link>
            </>
          ) : (
            <>
              <LandingButton
                href="/login"
                variant="navGhost"
                className="hidden text-white/90 hover:bg-white/10 hover:text-white lg:inline-flex"
              >
                Connexion
              </LandingButton>
              <LandingButton
                href="/inscription"
                variant="navOrange"
                className="px-3.5 text-[13.5px] sm:px-4 sm:text-[14px]"
              >
                <span className="sm:hidden">Commencer</span>
                <span className="hidden sm:inline">Commencer gratuitement</span>
              </LandingButton>
            </>
          )}
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => setOpen((o) => !o)}
            aria-expanded={open}
            aria-controls="site-mobile-menu"
            aria-label={open ? "Fermer le menu" : "Ouvrir le menu"}
            className={cn(
              "rounded-pill lg:hidden",
              light ? "text-[#262626] hover:bg-black/5" : "text-white hover:bg-white/10",
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
              "mx-auto mt-2 max-w-[1120px] rounded-[22px] border p-2 shadow-[0_8px_30px_rgba(10,10,10,0.08)] backdrop-blur-xl lg:hidden",
              light ? "site-nav-drawer--light border-[#f2f2f2] bg-white" : "border-line bg-[#0c0c0c]/95",
            )}
          >
            {light
              ? marketingItems.map((l) => (
                  <Link
                    key={l.href}
                    href={l.href}
                    prefetch={false}
                    onClick={() => setOpen(false)}
                    className={cn(
                      buttonVariants({ variant: "ghost", size: "lg" }),
                      "h-12 w-full justify-start rounded-[14px] px-4 text-[15px] text-[#262626] hover:bg-black/4",
                      l.active && "bg-black/5 font-semibold",
                    )}
                  >
                    {l.label}
                  </Link>
                ))
              : NAV_LINKS.map((l) => (
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
            <div
              className={cn(
                "mt-2 flex flex-col gap-2 border-t px-2 pt-3 pb-1",
                light ? "border-[#f2f2f2]" : "border-line",
              )}
            >
              {light ? (
                <>
                  <Link
                    href={LANDING_SIGNUP}
                    className="inline-flex min-h-11 w-full items-center justify-center rounded-xl border border-black/5 bg-white px-5 text-base font-medium text-black"
                  >
                    S&apos;inscrire
                  </Link>
                  <Link
                    href={LANDING_LOGIN}
                    className="inline-flex min-h-11 w-full items-center justify-center rounded-xl bg-[#ff642b] px-5 text-base font-medium text-white"
                  >
                    Connexion
                  </Link>
                </>
              ) : (
                <>
                  <LandingButton href="/inscription" variant="orange" fullWidth>
                    Commencer gratuitement
                  </LandingButton>
                  <LandingButton href="/login" variant="secondary" fullWidth className="min-h-11">
                    Connexion
                  </LandingButton>
                </>
              )}
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </header>
  );
}
