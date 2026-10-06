import Link from "next/link";
import { notFound } from "next/navigation";

import { BlogPostCard } from "@/components/site/blog/blog-post-card";
import { Reveal, RevealGroup } from "@/components/motion/reveal";
import { JsonLd } from "@/components/site/json-ld";
import { BRAND } from "@/lib/brand";
import {
  BLOG_METIER_HUBS,
  getBlogMetierHub,
  isBlogMetierSlug,
} from "@/lib/site/blog/metier-hubs";
import { getBlogPostsByMetier } from "@/lib/site/blog/posts";
import { siteMetadata } from "@/lib/seo";
import { breadcrumbJsonLd } from "@/lib/seo/json-ld";

type Props = { params: Promise<{ metierSlug: string }> };

export function generateStaticParams() {
  return BLOG_METIER_HUBS.map((hub) => ({ metierSlug: hub.slug }));
}

export async function generateMetadata({ params }: Props) {
  const { metierSlug } = await params;
  if (!isBlogMetierSlug(metierSlug)) return {};
  const hub = getBlogMetierHub(metierSlug)!;

  return {
    title: hub.title,
    description: hub.description,
    ...siteMetadata({
      title: `${hub.title} | Blog ${BRAND.name}`,
      description: hub.description,
      path: `/blog/metier/${hub.slug}`,
    }),
  };
}

export default async function BlogMetierHubPage({ params }: Props) {
  const { metierSlug } = await params;
  if (!isBlogMetierSlug(metierSlug)) notFound();

  const hub = getBlogMetierHub(metierSlug)!;
  const posts = getBlogPostsByMetier(metierSlug);

  return (
    <div className="px-4 pt-14 pb-16 sm:px-8 sm:pt-24 sm:pb-20">
      <JsonLd
        data={[
          breadcrumbJsonLd([
            { name: "Accueil", path: "/" },
            { name: "Blog", path: "/blog" },
            { name: hub.label, path: `/blog/metier/${hub.slug}` },
          ]),
        ]}
      />

      <RevealGroup className="mx-auto mb-12 flex max-w-[720px] flex-col gap-3 text-center">
        <Reveal>
          <Link href="/blog" className="text-sm font-medium text-accent-700 hover:text-accent-active hover:underline">
            ← Tous les articles
          </Link>
        </Reveal>
        <Reveal>
          <p className="mono-label">/ {hub.label} {"///"}</p>
        </Reveal>
        <Reveal>
          <h1 className="font-display text-[clamp(28px,4.5vw,44px)] leading-[1.06] font-semibold tracking-tightest text-balance text-ink-900">
            {hub.title}
          </h1>
        </Reveal>
        <Reveal>
          <p className="text-[16.5px] leading-relaxed text-ink-600">{hub.intro}</p>
        </Reveal>
        <Reveal>
          <p className="text-sm text-ink-500">
            <Link href="/inscription" className="font-medium text-accent-700 hover:text-accent-active hover:underline">
              Essayer {BRAND.name}
            </Link>
            {" "}
            pour analyser vos devis fournisseurs sur vos chantiers.
          </p>
        </Reveal>
      </RevealGroup>

      <div className="mx-auto max-w-[1120px]">
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {posts.map((post) => (
            <BlogPostCard key={post.slug} post={post} />
          ))}
        </div>
        {posts.length === 0 ? (
          <p className="mt-10 text-center text-muted-foreground">Articles à venir pour ce métier.</p>
        ) : null}
      </div>
    </div>
  );
}
