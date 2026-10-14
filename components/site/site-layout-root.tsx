"use client";

import { usePathname } from "next/navigation";

import { isMarketingLightPath } from "@/lib/site/is-marketing-light-path";
import { cn } from "@/lib/utils";

/** Racine layout site : thème clair landing sur blog, tarifs, légal, etc. */
export function SiteLayoutRoot({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isHome = pathname === "/";
  const marketingLight = isMarketingLightPath(pathname);

  return (
    <div
      className={cn(
        "theme-tarineo flex min-h-dvh flex-col overflow-x-clip pb-[env(safe-area-inset-bottom,0px)]",
        marketingLight && "theme-light bg-[#f0f0f0] text-[#262626]",
        !marketingLight && !isHome && "dark bg-bg text-ink",
        isHome &&
          "[&:has(.landing-v2)]:theme-light [&:has(.landing-v2)]:bg-[#f0f0f0] [&:has(.landing-v2)]:text-[#262626]",
      )}
      data-marketing-light={marketingLight ? "" : undefined}
    >
      {children}
    </div>
  );
}
