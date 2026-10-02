import type { MetadataRoute } from "next";
import { getSiteUrl } from "@/lib/site-url";

export default function robots(): MetadataRoute.Robots {
  const base = getSiteUrl();
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/api/",
          "/accueil",
          "/compte",
          "/parametres",
          "/onboarding",
          "/copilote",
          "/assistant",
          "/projets",
          "/schemas",
          "/themes",
          "/ressources",
          "/anatomie",
          "/audit",
          "/outils",
          "/composants",
          "/composants-2",
          "/abonnement",
          "/automatisations",
          "/admin",
        ],
      },
    ],
    sitemap: `${base}/sitemap.xml`,
    host: base,
  };
}
