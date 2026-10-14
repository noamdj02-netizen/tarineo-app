import type { Viewport } from "next";
import { JsonLd } from "@/components/site/json-ld";
import { SiteFooter } from "@/components/site/site-footer";
import { SiteLayoutRoot } from "@/components/site/site-layout-root";
import { SiteNav } from "@/components/site/site-nav";
import { organizationJsonLd, webSiteJsonLd } from "@/lib/seo/json-ld";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f0f0f0" },
    { color: "#050505" },
  ],
};

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <SiteLayoutRoot>
      <JsonLd data={[organizationJsonLd(), webSiteJsonLd()]} />
      <a
        href="#contenu"
        className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-[80] focus:rounded-pill focus:bg-white focus:px-4 focus:py-2.5 focus:text-[14px] focus:font-semibold focus:text-black focus:shadow-lift"
      >
        Aller au contenu
      </a>
      <SiteNav />
      <main id="contenu" className="flex-1">
        {children}
      </main>
      <SiteFooter />
    </SiteLayoutRoot>
  );
}
