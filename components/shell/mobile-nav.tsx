"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";
import { EASE } from "@/components/motion/reveal";
import { TABS, isActive } from "@/lib/nav";
import { cn } from "@/lib/utils";

/** Mobile : barre d'onglets noire en bas, défilable, zones tactiles ≥ 44 px. */
export function MobileNav() {
  const pathname = usePathname();
  const ref = useRef<HTMLDivElement>(null);

  // garde l'onglet actif visible
  useEffect(() => {
    ref.current
      ?.querySelector<HTMLElement>("[aria-current=page]")
      ?.scrollIntoView({ inline: "center", block: "nearest" });
  }, [pathname]);

  return (
    <nav
      aria-label="Navigation principale"
      className="fixed inset-x-0 bottom-0 z-40 bg-side text-side-ink lg:hidden"
      style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
    >
      <div
        ref={ref}
        className="flex overflow-x-auto px-2 py-1.5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {TABS.map(({ href, short, icon: Icon }) => {
          const on = isActive(pathname, href);
          return (
            <Link
              key={href}
              href={href}
              aria-current={on ? "page" : undefined}
              className={cn(
                "relative flex min-h-13 min-w-[72px] flex-none flex-col items-center justify-center gap-1 rounded-xl px-2 font-mono text-[9.5px] font-medium tracking-[0.08em] uppercase",
                on ? "text-side-ink" : "text-side-muted",
              )}
            >
              {on ? (
                <motion.span
                  layoutId="mobile-active"
                  transition={{ duration: 0.35, ease: EASE }}
                  className="absolute inset-0 rounded-xl border border-white/10 bg-gradient-to-b from-white/[.16] to-white/[.03]"
                  aria-hidden
                />
              ) : null}
              <Icon className="relative size-[18px]" aria-hidden />
              <span className="relative">{short}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
