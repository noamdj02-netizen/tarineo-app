import type { MetadataRoute } from "next";
import { BLOG_METIER_HUBS } from "@/lib/site/blog/metier-hubs";
import { BLOG_POSTS } from "@/lib/site/blog/posts";
import { getSiteUrl } from "@/lib/site-url";

const PUBLIC_PATHS = [
  "/",
  "/prix",
  "/blog",
  "/mentions-legales",
  "/confidentialite",
  "/cgv",
  "/inscription",
  "/login",
] as const;

export default function sitemap(): MetadataRoute.Sitemap {
  const base = getSiteUrl();
  const now = new Date();

  const staticEntries: MetadataRoute.Sitemap = PUBLIC_PATHS.map((path) => ({
    url: `${base}${path === "/" ? "" : path}`,
    lastModified: now,
    changeFrequency: path === "/" || path === "/blog" ? "weekly" : "monthly",
    priority: path === "/" ? 1 : path === "/prix" || path === "/blog" ? 0.85 : 0.5,
  }));

  const blogMetierEntries = BLOG_METIER_HUBS.map((hub) => ({
    url: `${base}/blog/metier/${hub.slug}`,
    lastModified: now,
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }));

  const blogEntries = BLOG_POSTS.map((post) => ({
    url: `${base}/blog/${post.slug}`,
    lastModified: new Date(post.updatedAt),
    changeFrequency: "monthly" as const,
    priority: 0.75,
  }));

  return [...staticEntries, ...blogMetierEntries, ...blogEntries];
}
