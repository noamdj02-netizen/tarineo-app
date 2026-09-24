import type { Metadata } from "next";
import { BRAND } from "@/lib/brand";
import { getSiteUrl } from "@/lib/site-url";

const defaultOg = "/opengraph-image";

/** Métadonnées partagées (titre, description, Open Graph, Twitter). */
export function siteMetadata(overrides?: {
  title?: string;
  description?: string;
  path?: string;
  noIndex?: boolean;
}): Metadata {
  const title = overrides?.title ?? BRAND.name;
  const description = overrides?.description ?? BRAND.description;
  const url = overrides?.path ? new URL(overrides.path, getSiteUrl()).href : getSiteUrl();
  const googleVerification = process.env.GOOGLE_SITE_VERIFICATION;

  return {
    ...(overrides?.title ? { title } : {}),
    ...(overrides?.description ? { description } : {}),
    ...(overrides?.path
      ? {
          alternates: {
            canonical: url,
            languages: { "fr-FR": url },
          },
        }
      : {}),
    category: "technology",
    creator: BRAND.name,
    publisher: BRAND.name,
    openGraph: {
      type: "website",
      locale: "fr_FR",
      url,
      siteName: BRAND.name,
      title,
      description,
      images: [{ url: defaultOg, width: 1200, height: 630, alt: `${BRAND.name} — ${BRAND.tagline}` }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [defaultOg],
    },
    robots: overrides?.noIndex ? { index: false, follow: false } : { index: true, follow: true },
    ...(googleVerification ? { verification: { google: googleVerification } } : {}),
  };
}
