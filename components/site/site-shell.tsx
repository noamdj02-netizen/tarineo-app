"use client";

import { usePathname } from "next/navigation";
import { Footer as LandingFooter } from "@/components/site/landing-v2/components/layout/Footer";
import { Header as LandingHeader } from "@/components/site/landing-v2/components/layout/Header";

/** Chrome marketing unique (nav + footer landing-v2) ; `/` garde son Hero intégré. */
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
    <div className="landing-v2 flex min-h-dvh flex-col bg-paper-100 text-ink-600 pb-[env(safe-area-inset-bottom,0px)]">
      {skipLink}
      <LandingHeader />
      <main id="contenu" className="min-h-0 flex-1">
        {children}
      </main>
      <LandingFooter />
    </div>
  );
}
