import { urlSite } from "@/lib/siteUrl";

export function LandingJsonLd() {
  const base = urlSite();
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        name: "Tarineo",
        url: base,
        logo: `${base}/brand/tarineo-mark.svg`,
        email: "contact@tarineo.com",
        description: "SaaS pour artisans du bâtiment — analyse de devis fournisseurs et alertes de hausse de prix.",
      },
      {
        "@type": "SoftwareApplication",
        name: "Tarineo",
        applicationCategory: "BusinessApplication",
        operatingSystem: "Web",
        offers: {
          "@type": "Offer",
          price: "17",
          priceCurrency: "EUR",
          priceSpecification: {
            "@type": "UnitPriceSpecification",
            price: "17",
            priceCurrency: "EUR",
            unitText: "MONTH",
          },
        },
        description:
          "Comparez vos devis et factures fournisseurs à votre historique d'achats. Détectez les hausse de prix chez Cedeo, Point P, Rexel et plus.",
      },
    ],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}
