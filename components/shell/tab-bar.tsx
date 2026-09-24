"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";
import { TABS, isActive } from "@/lib/nav";
import { cn } from "@/lib/utils";

/** Garde l'onglet actif visible dans une barre qui défile. */
function useActiveInView(pathname: string) {
  const ref = useRef<HTMLElement>(null);
  useEffect(() => {
    ref.current
      ?.querySelector<HTMLElement>("[aria-current=page]")
      ?.scrollIntoView({ inline: "center", block: "nearest" });
  }, [pathname]);
  return ref;
}

/** Desktop : pills collantes en haut, comme le HTML d'origine. */
export function TopTabs() {
  const pathname = usePathname();
  const ref = useActiveInView(pathname);
  return (
    <nav ref={ref} className="tabs hidden md:flex" aria-label="Onglets">
      {TABS.map(({ href, label, icon: Icon }) => {
        const on = isActive(pathname, href);
        return (
          <Link
            key={href}
            href={href}
            className="tab"
            aria-current={on ? "page" : undefined}
          >
            <Icon aria-hidden />
            {label}
          </Link>
        );
      })}
    </nav>
  );
}

/** Mobile : barre fixe en bas, défilable, zones tactiles ≥ 44 px. */
export function BottomTabs() {
  const pathname = usePathname();
  const ref = useActiveInView(pathname);

  return (
    <nav
      aria-label="Onglets"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-panel/95 backdrop-blur md:hidden"
      style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
    >
      <div
        ref={ref as React.RefObject<HTMLDivElement>}
        className="flex overflow-x-auto px-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {TABS.map(({ href, short, icon: Icon }) => {
          const on = isActive(pathname, href);
          return (
            <Link
              key={href}
              href={href}
              aria-current={on ? "page" : undefined}
              className={cn(
                "flex min-h-14 min-w-[68px] flex-none flex-col items-center justify-center gap-0.5 rounded-xl px-2 py-1.5 font-sans text-[11px] font-semibold outline-none focus-visible:ring-2 focus-visible:ring-brand",
                on ? "text-ink" : "text-ink2",
              )}
            >
              <span
                className={cn(
                  "grid h-7 w-12 place-items-center rounded-full transition-colors",
                  on && "bg-ink text-[var(--bg)]",
                )}
              >
                <Icon aria-hidden />
              </span>
              {short}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
