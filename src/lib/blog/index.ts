import { ARTICLES_BLOG } from "./articles";
import type { ArticleBlog } from "./types";

export type { ArticleBlog, BlocArticle } from "./types";

export function tousLesArticles(): ArticleBlog[] {
  return [...ARTICLES_BLOG].sort(
    (a, b) => new Date(b.datePublication).getTime() - new Date(a.datePublication).getTime()
  );
}

export function articleParSlug(slug: string): ArticleBlog | undefined {
  return ARTICLES_BLOG.find((a) => a.slug === slug);
}

export function slugsArticles(): string[] {
  return ARTICLES_BLOG.map((a) => a.slug);
}

export function formaterDateBlog(iso: string): string {
  return new Date(iso).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}
