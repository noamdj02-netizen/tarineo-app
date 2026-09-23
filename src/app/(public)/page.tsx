import type { Metadata } from "next";
import dynamic from "next/dynamic";
import { urlSite } from "@/lib/siteUrl";
import { LandingJsonLd } from "./_components/LandingJsonLd";
import { LandingHero } from "./LandingHero";
import { LandingAnnouncementBar } from "./_components/LandingAnnouncementBar";
import { LandingHowItWorksSection } from "./LandingHowItWorksSection";
import { LandingFeaturesSection } from "./LandingFeaturesSection";
import { ACCES_ANTICIPE_LIMITE_TOTAL } from "@/lib/accesAnticipe";

const LandingDistributorsSection = dynamic(() =>
  import("./LandingDistributorsSection").then((m) => ({ default: m.LandingDistributorsSection }))
);
const LandingProofSection = dynamic(() =>
  import("./LandingProofSection").then((m) => ({ default: m.LandingProofSection }))
);
const LandingPricingSection = dynamic(() =>
  import("./LandingPricingSection").then((m) => ({ default: m.LandingPricingSection }))
);
const LandingFaqSection = dynamic(() =>
  import("./LandingFaqSection").then((m) => ({ default: m.LandingFaqSection }))
);
const LandingFooter = dynamic(() =>
  import("./_components/LandingFooter").then((m) => ({ default: m.LandingFooter }))
);

export const metadata: Metadata = {
  title: "Tarineo — Contrôlez vos devis fournisseurs et détectez les hausses de prix",
  description:
    "Comparez vos devis fournisseurs à votre historique d'achats. Détectez les hausses de prix chez Cedeo, Point P, Rexel et 30+ distributeurs.",
  alternates: { canonical: urlSite() },
  openGraph: {
    title: "Tarineo — Contrôlez vos devis fournisseurs",
    description: "Protégez votre marge sur les achats matériaux.",
    url: urlSite(),
    type: "website",
    locale: "fr_FR",
    images: [{ url: "/og.png", width: 1200, height: 630, alt: "Tarineo" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Tarineo — Contrôlez vos devis fournisseurs",
    description: "Protégez votre marge sur les achats matériaux.",
    images: ["/og.png"],
  },
};

// Pas d'auth() ni de requête DB : la landing s'affiche tout de suite.
// Les utilisateurs connectés passent par « Mon espace » dans le header.
const CTA_INSCRIPTION = "/inscription";

export default function Home() {
  return (
    <div>
      <LandingJsonLd />
      <LandingHero ctaHref={CTA_INSCRIPTION} ctaLabel="Vérifier mon premier devis" />
      <LandingAnnouncementBar limiteTotal={ACCES_ANTICIPE_LIMITE_TOTAL} />
      <LandingHowItWorksSection />
      <LandingFeaturesSection ctaHref={CTA_INSCRIPTION} />
      <LandingDistributorsSection ctaHref={CTA_INSCRIPTION} />
      <LandingProofSection />
      <LandingPricingSection ctaHref={CTA_INSCRIPTION} />
      <LandingFaqSection />
      <LandingFooter />
    </div>
  );
}
