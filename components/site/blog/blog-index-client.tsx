"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

import { BlogPostCard } from "@/components/site/blog/blog-post-card";
import { blogPillActive, blogPillBase, blogPillIdle } from "@/lib/site/blog/blog-ui";
import { BLOG_METIERS, BLOG_POSTS } from "@/lib/site/blog/posts";
import type { BlogMetierSlug } from "@/lib/site/blog/types";
import { cn } from "@/lib/utils";

type Filter = BlogMetierSlug | "all";

export function BlogIndexClient() {
  const [filter, setFilter] = useState<Filter>("all");

  const posts = useMemo(() => {
    if (filter === "all") return BLOG_POSTS;
    return BLOG_POSTS.filter((p) => p.metierSlug === filter);
  }, [filter]);

  return (
    <div>
      <div className="mt-10 flex flex-wrap justify-center gap-2 sm:justify-start" role="tablist" aria-label="Filtrer par métier">
        <FilterChip active={filter === "all"} onClick={() => setFilter("all")} label="Tous les articles" />
        {BLOG_METIERS.map((m) => (
          <MetierHubChip key={m.slug} slug={m.slug} label={m.label} />
        ))}
      </div>

      <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {posts.map((post) => (
          <BlogPostCard key={post.slug} post={post} />
        ))}
      </div>

      {posts.length === 0 ? (
        <p className="mt-10 text-center text-ink-500">Aucun article pour ce métier pour l’instant.</p>
      ) : null}
    </div>
  );
}

function MetierHubChip({ slug, label }: { slug: BlogMetierSlug; label: string }) {
  return (
    <Link href={`/blog/metier/${slug}`} className={cn(blogPillBase, blogPillIdle)}>
      {label}
    </Link>
  );
}

function FilterChip({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      role="tab"
      aria-selected={active}
      onClick={onClick}
      className={cn(blogPillBase, active ? blogPillActive : blogPillIdle)}
    >
      {label}
    </button>
  );
}
