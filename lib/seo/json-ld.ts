import { BRAND } from "@/lib/brand";
import { FOUNDER, PRO, STARTER } from "@/lib/billing/plans";
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
        name: "Création",
        price: String(STARTER.month),
        priceCurrency: "EUR",
        description: "6 projets, 300 questions IA/mois, 100 schémas",
      },
      {
        "@type": "Offer",
        name: "Pro",
        price: String(PRO.month),
        priceCurrency: "EUR",
        description: "Projets et schémas illimités, agenda, copilote IA",
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
