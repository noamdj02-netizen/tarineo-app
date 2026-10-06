import Link from "next/link";

import { blogPillBase, blogPillIdle } from "@/lib/site/blog/blog-ui";
import { BLOG_METIER_HUBS } from "@/lib/site/blog/metier-hubs";
import { cn } from "@/lib/utils";

export function BlogMetierLinks() {
  return (
    <nav
      aria-label="Articles par métier"
      className="rounded-lg border border-line bg-paper-0/80 px-4 py-5 shadow-card sm:px-6"
    >
      <h2 className="text-center text-xs font-semibold uppercase tracking-[0.12em] text-ink-400">
        Par métier
      </h2>
      <ul className="mt-4 flex flex-wrap justify-center gap-2">
        {BLOG_METIER_HUBS.map((hub) => (
          <li key={hub.slug}>
            <Link href={`/blog/metier/${hub.slug}`} className={cn(blogPillBase, blogPillIdle, "px-3.5")}>
              {hub.label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
