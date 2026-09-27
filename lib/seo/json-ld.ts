import { BRAND } from "@/lib/brand";
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
    url: site(),
    logo: `${site()}${BRAND.logoSrc}`,
    description: BRAND.description,
    email: BRAND.contactEmail,
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
