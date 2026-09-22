import type { MetadataRoute } from "next";
import { slugsArticles } from "@/lib/blog";
import { urlSite } from "@/lib/siteUrl";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = urlSite();
  const now = new Date();

  const pagesStatiques: MetadataRoute.Sitemap = [
    { url: base, lastModified: now, changeFrequency: "weekly", priority: 1 },
    { url: `${base}/blog`, lastModified: now, changeFrequency: "weekly", priority: 0.9 },
    { url: `${base}/comment-ca-marche`, lastModified: now, changeFrequency: "monthly", priority: 0.85 },
    { url: `${base}/fonctionnalites`, lastModified: now, changeFrequency: "monthly", priority: 0.85 },
    { url: `${base}/tarifs`, lastModified: now, changeFrequency: "monthly", priority: 0.85 },
    { url: `${base}/contact`, lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    { url: `${base}/a-propos`, lastModified: now, changeFrequency: "monthly", priority: 0.75 },
    { url: `${base}/legal`, lastModified: now, changeFrequency: "yearly", priority: 0.4 },
    { url: `${base}/legal/confidentialite`, lastModified: now, changeFrequency: "yearly", priority: 0.4 },
    { url: `${base}/legal/cgu`, lastModified: now, changeFrequency: "yearly", priority: 0.4 },
    { url: `${base}/legal/cgv`, lastModified: now, changeFrequency: "yearly", priority: 0.4 },
    { url: `${base}/legal/mentions-legales`, lastModified: now, changeFrequency: "yearly", priority: 0.4 },
    { url: `${base}/legal/cookies`, lastModified: now, changeFrequency: "yearly", priority: 0.4 },
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
