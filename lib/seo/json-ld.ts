import { BRAND } from "@/lib/brand";
import { LEGAL_PUBLISHER } from "@/lib/legal/publisher";
import { FAQ_GROUPS, PRICING } from "@/lib/site/tarineo";
import { getSiteUrl } from "@/lib/site-url";

const site = () => getSiteUrl();

/** Organization — identité de marque pour Google & IA. */
export function organizationJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": `${site()}/#organization`,
    name: BRAND.name,
    legalName: LEGAL_PUBLISHER.legalName,
    url: site(),
    logo: `${site()}${BRAND.logoSrc}`,
    description: BRAND.description,
    email: BRAND.contactEmail,
    address: {
      "@type": "PostalAddress",
      streetAddress: LEGAL_PUBLISHER.addressLine,
      postalCode: LEGAL_PUBLISHER.postalCode,
      addressLocality: LEGAL_PUBLISHER.city,
      addressCountry: "FR",
    },
  };
}

/** WebSite — page d’accueil canonique, langue FR. */
export function webSiteJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${site()}/#website`,
    name: BRAND.name,
    url: site(),
    inLanguage: "fr-FR",
    description: BRAND.description,
    publisher: { "@id": `${site()}/#organization` },
  };
}

/** Logiciel — fiche produit pour rich results & citations IA. */
export function softwareApplicationJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "@id": `${site()}/#software`,
    name: BRAND.name,
    url: site(),
    applicationCategory: "BusinessApplication",
    operatingSystem: "Web",
    inLanguage: "fr-FR",
    description: BRAND.description,
    offers: PRICING.map((p) => ({
      "@type": "Offer",
      name: p.name,
      price: String(p.month),
      priceCurrency: "EUR",
      description: p.text,
    })),
    featureList: [
      "Import de devis et factures fournisseurs en PDF ou photo",
      "Extraction automatique des lignes et des prix",
      "Comparaison avec l’historique de prix et détection des hausses",
    ],
    publisher: { "@id": `${site()}/#organization` },
  };
}

/** FAQ — toutes les questions des onglets landing. */
export function faqPageJsonLd() {
  const items = FAQ_GROUPS.flatMap((g) => g.items);
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "@id": `${site()}/#faq`,
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.q,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.a,
      },
    })),
  };
}

export function blogPostingJsonLd(post: {
  title: string;
  description: string;
  slug: string;
  publishedAt: string;
  updatedAt: string;
}) {
  const url = `${site()}/blog/${post.slug}`;
  return {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.description,
    datePublished: post.publishedAt,
    dateModified: post.updatedAt,
    inLanguage: "fr-FR",
    mainEntityOfPage: { "@type": "WebPage", "@id": url },
    url,
    author: { "@id": `${site()}/#organization` },
    publisher: { "@id": `${site()}/#organization` },
  };
}

export function blogIndexJsonLd(posts: { title: string; slug: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "Blog",
    "@id": `${site()}/blog#blog`,
    name: `Blog ${BRAND.name}`,
    description: BRAND.description,
    url: `${site()}/blog`,
    inLanguage: "fr-FR",
    publisher: { "@id": `${site()}/#organization` },
    blogPost: posts.map((p) => ({
      "@type": "BlogPosting",
      headline: p.title,
      url: `${site()}/blog/${p.slug}`,
    })),
  };
}

export function breadcrumbJsonLd(items: { name: string; path: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: item.path === "/" ? site() : `${site()}${item.path}`,
    })),
  };
}
