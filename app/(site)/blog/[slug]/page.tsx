import Link from "next/link";
import { notFound } from "next/navigation";

import { Reveal, RevealGroup } from "@/components/motion/reveal";
import { JsonLd } from "@/components/site/json-ld";
import { BLOG_POSTS, getBlogPost } from "@/lib/site/blog/posts";
import { siteMetadata } from "@/lib/seo";
import { blogPostingJsonLd, breadcrumbJsonLd } from "@/lib/seo/json-ld";

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return BLOG_POSTS.map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const post = getBlogPost(slug);
  if (!post) return {};

  return {
    title: post.title,
    description: post.metaDescription,
    keywords: post.keywords,
    ...siteMetadata({
      title: post.title,
      description: post.metaDescription,
      path: `/blog/${post.slug}`,
    }),
  };
}

export default async function BlogArticlePage({ params }: Props) {
  const { slug } = await params;
  const post = getBlogPost(slug);
  if (!post) notFound();

  return (
    <article className="shell pb-16 pt-[5.5rem] sm:pb-20 sm:pt-28">
      <JsonLd
        data={[
          breadcrumbJsonLd([
            { name: "Accueil", path: "/" },
            { name: "Blog", path: "/blog" },
            { name: post.metier, path: `/blog/metier/${post.metierSlug}` },
            { name: post.title, path: `/blog/${post.slug}` },
          ]),
          blogPostingJsonLd({
            title: post.title,
            description: post.metaDescription,
            slug: post.slug,
            publishedAt: post.publishedAt,
            updatedAt: post.updatedAt,
          }),
        ]}
      />

      <div className="mx-auto max-w-[720px]">
        <RevealGroup className="flex flex-col gap-4">
          <Reveal>
            <Link
              href="/blog"
              className="text-sm font-medium text-accent-700 hover:text-accent-active hover:underline"
            >
              ← Retour au blog
            </Link>
          </Reveal>
          <Reveal>
            <p className="mono-label">
              /{" "}
              <Link
                href={`/blog/metier/${post.metierSlug}`}
                className="hover:text-accent-700 hover:underline"
              >
                {post.metier}
              </Link>
              {" ///"}
            </p>
          </Reveal>
          <Reveal>
            <h1 className="font-display text-[clamp(28px,4.5vw,42px)] leading-[1.08] font-semibold tracking-tightest text-balance text-ink-900">
              {post.title}
            </h1>
          </Reveal>
          <Reveal>
            <p className="text-sm text-ink-400 nums">
              {post.readingMinutes} min de lecture · Mis à jour le{" "}
              <time dateTime={post.updatedAt}>
                {new Date(post.updatedAt).toLocaleDateString("fr-FR", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              </time>
            </p>
          </Reveal>
          <Reveal>
            <p className="text-[17px] leading-relaxed text-ink-600">{post.metaDescription}</p>
          </Reveal>
        </RevealGroup>

        <section className="mt-10 rounded-lg border border-line bg-accent-soft/60 p-5 sm:p-6">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-ink-900">
            Problèmes fréquents sur le terrain
          </h2>
          <ul className="mt-4 flex flex-col gap-2 text-[15px] leading-relaxed text-ink-600">
            {post.problems.map((problem) => (
              <li key={problem} className="flex gap-2">
                <span className="text-accent-700" aria-hidden>•</span>
                {problem}
              </li>
            ))}
          </ul>
        </section>

        <div className="prose-tarineo mt-10 flex flex-col gap-8">
          {post.sections.map((section) => (
            <section key={section.heading}>
              <h2 className="font-display text-2xl font-semibold tracking-tight text-ink-900">
                {section.heading}
              </h2>
              {section.paragraphs.map((paragraph) => (
                <p key={paragraph.slice(0, 40)} className="mt-3 text-[16px] leading-relaxed text-ink-600">
                  {paragraph}
                </p>
              ))}
            </section>
          ))}
        </div>

        <aside className="mt-14 rounded-lg border border-line bg-paper-0 p-6 shadow-card">
          <h2 className="font-display text-xl font-semibold tracking-tight text-ink-900">Passez à l’action</h2>
          <p className="mt-2 text-sm leading-relaxed text-ink-600">
            Importez un devis fournisseur, comparez vos prix et préparez votre devis client avec Tarinéo.
          </p>
          <div className="mt-4 flex flex-wrap gap-3">
            <Link
              href="/inscription"
              className="inline-flex min-h-11 items-center justify-center rounded-full bg-accent px-5 text-sm font-medium text-paper-0 shadow-accent transition-[filter] hover:brightness-95"
            >
              Créer un compte
            </Link>
            <Link
              href="/#devis-facture"
              className="inline-flex min-h-11 items-center justify-center rounded-full border border-line bg-paper-0 px-5 text-sm font-medium text-ink-900 transition-colors hover:bg-paper-50"
            >
              Essai gratuit sur la landing
            </Link>
          </div>
        </aside>
      </div>
    </article>
  );
}
