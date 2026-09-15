import Link from "next/link";
import { tousLesArticles } from "@/lib/blog";
import { BlogCard } from "./BlogCard";
import { LandingSectionHeader } from "./LandingSectionHeader";

export function BlogPreviewSection() {
  const recents = tousLesArticles().slice(0, 3);

  return (
    <section className="border-t border-border bg-background px-4 py-16 sm:px-6 sm:py-24">
      <div className="mx-auto max-w-[1100px]">
        <div className="mb-10 flex flex-col gap-4 sm:mb-12 sm:flex-row sm:items-end sm:justify-between">
          <LandingSectionHeader
            titre="Conseils pour défendre votre marge"
            description="Guides pratiques sur les prix fournisseurs, la négociation et l'organisation des achats."
          />
          <Link
            href="/blog"
            className="shrink-0 self-start rounded-full border border-border px-5 py-2.5 text-sm font-semibold text-foreground transition-colors hover:border-accent hover:text-accent sm:self-auto"
          >
            Tous les articles
          </Link>
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          {recents.map((article) => (
            <BlogCard key={article.slug} article={article} />
          ))}
        </div>
      </div>
    </section>
  );
}
