import type { Metadata } from "next";
import Link from "next/link";
import { tousLesArticles } from "@/lib/blog";
import { urlSite } from "@/lib/siteUrl";
import { BlogCard } from "../_components/BlogCard";
import { LandingFooter } from "../_components/LandingFooter";
import { LandingSectionHeader } from "../_components/LandingSectionHeader";

export const metadata: Metadata = {
  title: "Blog Tarineo | Conseils achats et marge pour artisans du bâtiment",
  description:
    "Guides pratiques pour négocier vos prix fournisseurs, suivre vos achats Cedeo Point P Rexel et protéger la marge de vos chantiers.",
  alternates: { canonical: `${urlSite()}/blog` },
  openGraph: {
    title: "Blog Tarineo",
    description: "Conseils achats et marge pour artisans du bâtiment.",
    url: `${urlSite()}/blog`,
    type: "website",
    locale: "fr_FR",
  },
};

export default function BlogIndexPage() {
  const articles = tousLesArticles();

  return (
    <>
      <div className="px-4 py-12 sm:px-6 sm:py-16">
        <div className="mx-auto max-w-[1100px]">
          <nav className="mb-8 text-sm text-muted" aria-label="Fil d'Ariane">
            <Link href="/" className="transition-colors hover:text-accent">
              Accueil
            </Link>
            <span className="mx-2 text-border">/</span>
            <span className="text-foreground">Blog</span>
          </nav>

          <LandingSectionHeader
            eyebrow="Blog"
            titre="Conseils pour artisans du bâtiment"
            description="Négociation fournisseur, suivi des prix, réglementation et organisation des achats. Des articles concrets pour protéger votre marge."
            className="mb-12"
          />

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {articles.map((article) => (
              <BlogCard key={article.slug} article={article} />
            ))}
          </div>

          <div className="mt-14 rounded-2xl border border-accent/25 bg-accent/[0.06] p-8 text-center">
            <h2 className="mb-2 text-xl font-bold text-white">Passez de la lecture à l&apos;action</h2>
            <p className="mx-auto mb-6 max-w-md text-sm text-muted">
              Importez un devis fournisseur et comparez-le à votre historique en moins de 10 secondes.
            </p>
            <Link
              href="/inscription"
              className="inline-flex rounded-full bg-accent px-7 py-3 text-sm font-bold text-accent-foreground transition-opacity hover:opacity-90 active:scale-[0.98]"
            >
              Essayer gratuitement
            </Link>
          </div>
        </div>
      </div>
      <LandingFooter />
    </>
  );
}
