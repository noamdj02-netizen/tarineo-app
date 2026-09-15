import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  articleParSlug,
  formaterDateBlog,
  slugsArticles,
  tousLesArticles,
} from "@/lib/blog";
import { urlSite } from "@/lib/siteUrl";
import { ArticleContent } from "../../_components/ArticleContent";
import { BlogCard } from "../../_components/BlogCard";
import { LandingFooter } from "../../_components/LandingFooter";

interface Props {
  params: Promise<{ slug: string }>;
}

export function generateStaticParams() {
  return slugsArticles().map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const article = articleParSlug(slug);
  if (!article) return { title: "Article introuvable" };

  const url = `${urlSite()}/blog/${article.slug}`;

  return {
    title: `${article.titre} | Blog Tarineo`,
    description: article.description,
    keywords: article.motsCles,
    alternates: { canonical: url },
    openGraph: {
      title: article.titre,
      description: article.description,
      url,
      type: "article",
      locale: "fr_FR",
      publishedTime: article.datePublication,
    },
  };
}

export default async function BlogArticlePage({ params }: Props) {
  const { slug } = await params;
  const article = articleParSlug(slug);
  if (!article) notFound();

  const url = `${urlSite()}/blog/${article.slug}`;
  const autres = tousLesArticles().filter((a) => a.slug !== slug).slice(0, 2);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: article.titre,
    description: article.description,
    datePublished: article.datePublication,
    author: { "@type": "Organization", name: "Tarineo" },
    publisher: {
      "@type": "Organization",
      name: "Tarineo",
      url: urlSite(),
    },
    mainEntityOfPage: { "@type": "WebPage", "@id": url },
    keywords: article.motsCles.join(", "),
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <article className="px-4 py-12 sm:px-6 sm:py-16">
        <div className="mx-auto max-w-3xl">
          <nav className="mb-8 text-sm text-muted" aria-label="Fil d'Ariane">
            <Link href="/" className="transition-colors hover:text-accent">
              Accueil
            </Link>
            <span className="mx-2 text-border">/</span>
            <Link href="/blog" className="transition-colors hover:text-accent">
              Blog
            </Link>
            <span className="mx-2 text-border">/</span>
            <span className="line-clamp-1 text-foreground">{article.titre}</span>
          </nav>

          <header className="mb-10 border-b border-border pb-8">
            <div className="mb-4 flex flex-wrap items-center gap-2 text-xs">
              <span className="rounded-full border border-accent/30 bg-accent/10 px-2.5 py-0.5 font-semibold uppercase tracking-wide text-accent">
                {article.categorie}
              </span>
              <time dateTime={article.datePublication} className="text-muted">
                {formaterDateBlog(article.datePublication)}
              </time>
              <span className="text-muted">{article.tempsLectureMin} min de lecture</span>
            </div>
            <h1 className="text-3xl font-extrabold leading-tight text-white sm:text-4xl">{article.titre}</h1>
            <p className="mt-4 text-lg leading-relaxed text-muted">{article.description}</p>
          </header>

          <ArticleContent blocs={article.contenu} />

          <div className="mt-12 rounded-2xl border border-accent/25 bg-accent/[0.06] p-6 sm:p-8">
            <h2 className="mb-2 text-lg font-bold text-white">Comparez vos devis à votre historique</h2>
            <p className="mb-5 text-sm leading-relaxed text-muted">
              Tarineo extrait les lignes de vos devis fournisseurs et détecte les hausses par rapport à vos achats
              passés. Essai gratuit, sans carte bancaire.
            </p>
            <Link
              href="/inscription"
              className="inline-flex rounded-full bg-accent px-6 py-3 text-sm font-bold text-accent-foreground transition-opacity hover:opacity-90 active:scale-[0.98]"
            >
              Essayer gratuitement
            </Link>
          </div>
        </div>

        {autres.length > 0 && (
          <div className="mx-auto mt-16 max-w-[1100px] border-t border-border pt-12">
            <h2 className="mb-6 text-xl font-bold text-white">À lire aussi</h2>
            <div className="grid gap-6 sm:grid-cols-2">
              {autres.map((a) => (
                <BlogCard key={a.slug} article={a} />
              ))}
            </div>
          </div>
        )}
      </article>
      <LandingFooter />
    </>
  );
}
