import type { Viewport } from "next";
import { JsonLd } from "@/components/site/json-ld";
import { SiteFooter } from "@/components/site/site-footer";
import { SiteNav } from "@/components/site/site-nav";
import { organizationJsonLd, webSiteJsonLd } from "@/lib/seo/json-ld";

/** Chrome Safari aligné sur le film hero (plus de bandeau clair). */
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#111111",
};

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-dvh flex-col overflow-x-clip bg-bg">
      <JsonLd data={[organizationJsonLd(), webSiteJsonLd()]} />
      <SiteNav />
      <main className="flex-1">{children}</main>
      <SiteFooter />
    </div>
  );
}
