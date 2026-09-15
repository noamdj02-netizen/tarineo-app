import Link from "next/link";
import type { ArticleBlog } from "@/lib/blog";
import { formaterDateBlog } from "@/lib/blog";

export function BlogCard({ article }: { article: ArticleBlog }) {
  return (
    <article className="group flex h-full flex-col rounded-2xl border border-border bg-surface p-6 transition-colors hover:border-accent/40">
      <div className="mb-4 flex flex-wrap items-center gap-2 text-xs">
        <span className="rounded-full border border-accent/30 bg-accent/10 px-2.5 py-0.5 font-semibold uppercase tracking-wide text-accent">
          {article.categorie}
        </span>
        <span className="text-muted">{formaterDateBlog(article.datePublication)}</span>
        <span className="text-muted">{article.tempsLectureMin} min</span>
      </div>
      <h2 className="mb-2 text-lg font-bold leading-snug text-white group-hover:text-accent">
        <Link href={`/blog/${article.slug}`} className="outline-offset-4">
          {article.titre}
        </Link>
      </h2>
      <p className="mb-5 flex-1 text-sm leading-relaxed text-muted">{article.description}</p>
      <Link
        href={`/blog/${article.slug}`}
        className="text-sm font-semibold text-accent transition-opacity hover:opacity-80"
      >
        Lire l&apos;article
      </Link>
    </article>
  );
}
