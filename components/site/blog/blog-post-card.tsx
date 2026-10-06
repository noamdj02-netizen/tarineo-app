import Link from "next/link";

import { blogCard } from "@/lib/site/blog/blog-ui";
import type { BlogPost } from "@/lib/site/blog/types";
import { cn } from "@/lib/utils";

export function BlogPostCard({ post }: { post: BlogPost }) {
  return (
    <article className={cn(blogCard, "bg-paper-0")}>
      <div className="flex flex-wrap items-center gap-2 text-xs text-ink-400">
        <Link
          href={`/blog/metier/${post.metierSlug}`}
          className="rounded-full border border-line bg-paper-50 px-2.5 py-1 font-medium text-ink-700 transition-colors hover:border-accent/35 hover:bg-accent-soft hover:text-accent-700"
        >
          {post.metier}
        </Link>
        <span className="nums">{post.readingMinutes} min</span>
        <span aria-hidden>·</span>
        <time dateTime={post.updatedAt} className="nums">
          Mis à jour le {formatDateFr(post.updatedAt)}
        </time>
      </div>
      <h2 className="mt-3 font-display text-xl font-semibold tracking-tight text-ink-900">
        <Link
          href={`/blog/${post.slug}`}
          className="rounded-sm outline-none transition-colors group-hover:text-accent-700 focus-visible:ring-2 focus-visible:ring-accent/45"
        >
          {post.title}
        </Link>
      </h2>
      <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-ink-600">{post.metaDescription}</p>
      <ul className="mt-4 flex flex-col gap-1.5 border-t border-line pt-4 text-sm text-ink-600">
        {post.problems.slice(0, 2).map((problem) => (
          <li key={problem} className="flex gap-2">
            <span className="text-accent-700" aria-hidden>—</span>
            <span>{problem}</span>
          </li>
        ))}
      </ul>
      <Link
        href={`/blog/${post.slug}`}
        className="mt-5 text-sm font-medium text-accent-700 transition-colors hover:text-accent-active hover:underline"
      >
        Lire l’article
      </Link>
    </article>
  );
}

function formatDateFr(iso: string) {
  return new Date(iso).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}
