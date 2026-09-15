import type { MetadataRoute } from "next";
import { slugsArticles } from "@/lib/blog";
import { urlSite } from "@/lib/siteUrl";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = urlSite();
  const now = new Date();

  const pagesStatiques: MetadataRoute.Sitemap = [
    { url: base, lastModified: now, changeFrequency: "weekly", priority: 1 },
    { url: `${base}/blog`, lastModified: now, changeFrequency: "weekly", priority: 0.9 },
    { url: `${base}/inscription`, lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    { url: `${base}/connexion`, lastModified: now, changeFrequency: "monthly", priority: 0.5 },
  ];

  const articles: MetadataRoute.Sitemap = slugsArticles().map((slug) => ({
    url: `${base}/blog/${slug}`,
    lastModified: now,
    changeFrequency: "monthly" as const,
    priority: 0.7,
  }));

  return [...pagesStatiques, ...articles];
}
