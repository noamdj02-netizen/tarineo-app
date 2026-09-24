import { JsonLd } from "@/components/site/json-ld";
import { SiteFooter } from "@/components/site/site-footer";
import { SiteNav } from "@/components/site/site-nav";
import { organizationJsonLd, webSiteJsonLd } from "@/lib/seo/json-ld";

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-dvh flex-col overflow-x-clip bg-surface pb-[env(safe-area-inset-bottom,0px)]">
      <JsonLd data={[organizationJsonLd(), webSiteJsonLd()]} />
      <SiteNav />
      <main className="flex-1">{children}</main>
      <SiteFooter />
    </div>
  );
}
