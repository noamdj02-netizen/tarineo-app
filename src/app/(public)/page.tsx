import type { Metadata } from "next";
import { auth } from "@/auth";
import { etatAccesAnticipeDepuisDb, ACCES_ANTICIPE_LIMITE_TOTAL } from "@/lib/accesAnticipe";
import { urlSite } from "@/lib/siteUrl";
import { LandingHero } from "./LandingHero";
import { LandingAnnouncementBar } from "./_components/LandingAnnouncementBar";
import { LandingHowItWorksSection } from "./LandingHowItWorksSection";
import { LandingFeaturesSection } from "./LandingFeaturesSection";
import { LandingDistributorsSection } from "./LandingDistributorsSection";
import { LandingProofSection } from "./LandingProofSection";
import { LandingPricingSection } from "./LandingPricingSection";
import { LandingFaqSection } from "./LandingFaqSection";
import { LandingFooter } from "./_components/LandingFooter";

export const metadata: Metadata = {
  title: "Tarineo | L'assistant qui protège votre marge",
  description:
    "Comparez vos devis fournisseurs à votre historique d'achats. Détectez les hausse de prix chez Cedeo, Point P, Rexel et 30+ distributeurs.",
  alternates: { canonical: urlSite() },
  openGraph: {
    title: "Tarineo",
    description: "Protégez votre marge sur les achats matériaux.",
    url: urlSite(),
    type: "website",
    locale: "fr_FR",
  },
};

export default async function Home() {
  const session = await auth();
  const accesComplet = (await etatAccesAnticipeDepuisDb()).phase === "complete";

  const cta = session?.user ? "/documents" : "/inscription";
  const ctaLabelHero = session?.user
    ? "Aller à mes documents"
    : accesComplet
      ? "Rejoindre la liste d'attente"
      : "Vérifier mon premier devis";

  return (
    <div>
      <LandingHero ctaHref={cta} ctaLabel={ctaLabelHero} />
      <LandingAnnouncementBar limiteTotal={ACCES_ANTICIPE_LIMITE_TOTAL} />
      <LandingHowItWorksSection />
      <LandingFeaturesSection ctaHref={cta} />
      <LandingDistributorsSection ctaHref={cta} />
      <LandingProofSection />
      <LandingPricingSection ctaHref={cta} />
      <LandingFaqSection />
      <LandingFooter />
    </div>
  );
}
