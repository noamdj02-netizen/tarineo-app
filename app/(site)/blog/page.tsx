import Link from "next/link";

import { BlogIndexClient } from "@/components/site/blog/blog-index-client";
import { Reveal, RevealGroup } from "@/components/motion/reveal";
import { JsonLd } from "@/components/site/json-ld";
import { BRAND } from "@/lib/brand";
import { BLOG_POSTS } from "@/lib/site/blog/posts";
import { siteMetadata } from "@/lib/seo";
import { blogIndexJsonLd, breadcrumbJsonLd } from "@/lib/seo/json-ld";

const BLOG_DESCRIPTION =
  "Guides par métier du bâtiment : devis fournisseurs, marge, chantiers, facturation électronique et administratif pour artisans et TPE du BTP. Ressources mises à jour pour la pratique terrain.";

export const metadata = {
  title: "Blog",
  description: BLOG_DESCRIPTION,
  ...siteMetadata({
    title: `Blog ${BRAND.name} — artisans & chantiers`,
    description: BLOG_DESCRIPTION,
    path: "/blog",
  }),
};

export default function BlogPage() {
  return (
    <div className="shell pb-16 pt-[5.5rem] sm:pb-20 sm:pt-28">
      <JsonLd
        data={[
          breadcrumbJsonLd([
            { name: "Accueil", path: "/" },
            { name: "Blog", path: "/blog" },
          ]),
          blogIndexJsonLd(BLOG_POSTS.map((p) => ({ title: p.title, slug: p.slug }))),
        ]}
      />

      <RevealGroup className="mx-auto mb-12 flex max-w-[720px] flex-col gap-3 text-center">
        <Reveal>
          <p className="mono-label">/ Ressources {"///"}</p>
        </Reveal>
        <Reveal>
          <h1 className="font-display text-[clamp(32px,5.5vw,52px)] leading-[1.05] font-semibold tracking-tightest text-balance text-ink-900">
            Blog <span className="text-ink-400">{BRAND.name}</span>
          </h1>
        </Reveal>
        <Reveal>
          <p className="text-[16.5px] leading-relaxed text-ink-600">{BLOG_DESCRIPTION}</p>
        </Reveal>
        <Reveal>
          <p className="text-sm text-ink-500">
            <Link href="/inscription" className="font-medium text-accent-700 hover:text-accent-active hover:underline">
              Essayer {BRAND.name}
            </Link>
            {" "}
            pour analyser vos devis fournisseurs et suivre vos chantiers.
          </p>
        </Reveal>
      </RevealGroup>

      <div className="mx-auto max-w-[1120px]">
        <BlogIndexClient />
      </div>
    </div>
  );
}
