import { BRAND } from "@/lib/brand";
import { FOUNDER, LOYALTY_TIERS } from "@/lib/billing/plans";
import { FAQ_GROUPS } from "@/lib/site/content";
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
    email: "contact@navpit.com",
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

/** Produit SaaS — fiche logiciel pour rich results & citations IA. */
export function softwareApplicationJsonLd() {
  const [y1] = LOYALTY_TIERS;
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
    offers: [
      {
        "@type": "Offer",
        name: "Gratuit",
        price: "0",
        priceCurrency: "EUR",
        description: "Plan gratuit sans carte bancaire",
      },
      {
        "@type": "Offer",
        name: "Pro",
        price: String(y1.month),
        priceCurrency: "EUR",
        description: "Abonnement Pro avec prix fidélité dégressif",
      },
      {
        "@type": "Offer",
        name: "Fondateur",
        price: String(FOUNDER.price),
        priceCurrency: "EUR",
        description: "Accès Pro à vie, places limitées",
      },
    ],
    featureList: [
      "Un seul projet en Focus jusqu’à la première vente",
      "Copilote IA avec contexte projets et tâches",
      "Schémas, ressources design et planning",
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
