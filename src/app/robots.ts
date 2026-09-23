import type { MetadataRoute } from "next";
import { urlSite } from "@/lib/siteUrl";

export default function robots(): MetadataRoute.Robots {
  const base = urlSite();
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
        "/accueil",
        "/documents",
        "/compte",
        "/parametres",
        "/plus",
        "/devis-clients",
        "/factures-clients",
        "/facturation-clients",
        "/fournisseurs",
        "/depenses",
        "/onboarding",
        "/api/",
      ],
    },
    sitemap: `${base}/sitemap.xml`,
    host: base,
  };
}
