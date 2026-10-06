"use client";

import { usePathname } from "next/navigation";
import { SiteFooter } from "@/components/site/site-footer";
import { SiteNav } from "@/components/site/site-nav";

/** Chrome marketing (nav + footer) ; la landing v2 gère son propre header/footer sur `/`. */
export function SiteShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isLandingV2 = pathname === "/";
  const skipTarget = isLandingV2 ? "#contenu-landing" : "#contenu";

  const skipLink = (
    <a
      href={skipTarget}
      className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-[80] focus:rounded-pill focus:bg-white focus:px-4 focus:py-2.5 focus:text-[14px] focus:font-semibold focus:text-black focus:shadow-lift"
    >
      Aller au contenu
    </a>
  );

  if (isLandingV2) {
    return (
      <div className="min-h-dvh bg-paper-100 text-ink-600">
        {skipLink}
        {children}
      </div>
    );
  }

  return (
    <div className="theme-tarineo dark flex min-h-dvh flex-col overflow-x-clip bg-bg text-ink pb-[env(safe-area-inset-bottom,0px)]">
      {skipLink}
      <SiteNav />
      <main id="contenu" className="flex-1">
        {children}
      </main>
      <SiteFooter />
    </div>
  );
}
