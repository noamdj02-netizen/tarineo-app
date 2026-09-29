import { JsonLd } from "@/components/site/json-ld";
import { LandingAudience } from "@/components/site/landing-audience";
import { LandingClosingCta } from "@/components/site/landing-cta";
import {
  DeferredFaqTabs,
  DeferredPricing,
  DeferredProductChantier,
  DeferredProductCopilote,
  DeferredProductDevisIa,
  DeferredProductDocuments,
  DeferredProductFeatures,
  DeferredProductPipeline,
} from "@/components/site/landing-deferred";
import { LandingFounder } from "@/components/site/landing-founder";
import { LandingHero } from "@/components/site/landing-hero";
import { LandingSection, LandingSectionHead } from "@/components/site/landing-section";
import { BRAND } from "@/lib/brand";
import { siteMetadata } from "@/lib/seo";
import { faqPageJsonLd, softwareApplicationJsonLd } from "@/lib/seo/json-ld";
import { FAQ_GROUPS } from "@/lib/site/tarineo";

const HOME_TITLE = `${BRAND.name} — L’assistant qui protège votre marge`;

export const metadata = {
  ...siteMetadata({ title: HOME_TITLE, description: BRAND.description, path: "/" }),
  title: { absolute: HOME_TITLE },
  description: BRAND.description,
};

export default function LandingPage() {
  return (
    <div className="theme-light bg-[#F5F5F3] text-[#0A0A0A]">
      <JsonLd data={[softwareApplicationJsonLd(), faqPageJsonLd()]} />

      <LandingHero />

      <LandingSection id="devis-ia" className="bg-[#FFFFFF]">
        <LandingSectionHead
          label="Devis IA"
          title="Créez et analysez vos devis avec l’IA."
          text="Transformez vos documents et vos idées en devis structurés, sans repartir de zéro."
        />
        <DeferredProductDevisIa />
      </LandingSection>

      <LandingSection id="documents" className="bg-[#F5F5F3]">
        <LandingSectionHead
          label="Documents fournisseurs"
          title="Ne laissez plus une hausse passer inaperçue."
          text="TARINEO analyse vos documents fournisseurs et vous aide à repérer les variations de prix."
        />
        <DeferredProductDocuments />
      </LandingSection>

      <LandingSection id="chantiers" className="bg-[#FFFFFF]">
        <LandingSectionHead
          label="Chantiers"
          title="Un chantier. Tous vos documents."
          text="Devis, achats, documents et marge réunis dans le même contexte."
        />
        <DeferredProductChantier />
      </LandingSection>

      <LandingSection id="comment-ca-marche" className="bg-[#F5F5F3]">
        <LandingSectionHead
          label="Cycle documentaire"
          title="Devis → commande → facture."
          text="Faites évoluer vos documents sans ressaisie inutile."
        />
        <DeferredProductPipeline />
      </LandingSection>

      <LandingSection id="copilote" className="bg-[#FFFFFF]">
        <LandingSectionHead
          label="Copilote"
          title="Votre copilote connaît vos chantiers."
          text="Posez une question sur votre activité. TARINEO vous aide à retrouver l’information utile."
        />
        <DeferredProductCopilote />
      </LandingSection>

      <LandingSection id="fonctionnalites" className="bg-[#F5F5F3]">
        <LandingSectionHead
          label="Produit"
          title="Tout votre métier au même endroit."
          text="Devis, documents, chantiers, achats, prix, facturation et copilote — le même design que dans l’app."
        />
        <DeferredProductFeatures />
      </LandingSection>

      <LandingSection id="artisans" className="bg-[#FFFFFF]">
        <LandingSectionHead
          label="Pour qui"
          title="Pensé pour la réalité des artisans."
          text="Les corps d’état qui achètent chez les distributeurs et facturent au chantier."
        />
        <LandingAudience />
      </LandingSection>

      <LandingSection id="qui" className="bg-[#F5F5F3]">
        <LandingSectionHead
          label="Fondateur"
          title="Un ancien des chantiers, pas une start-up hors-sol."
        />
        <LandingFounder />
      </LandingSection>

      <LandingSection id="tarifs" className="bg-[#FFFFFF]">
        <LandingSectionHead
          label="Tarifs"
          title="Le 1er mois est offert. Ensuite, dès 17 € par mois."
        />
        <DeferredPricing />
      </LandingSection>

      <LandingSection id="faq" className="bg-[#F5F5F3]">
        <LandingSectionHead
          label="FAQ"
          title="Questions fréquentes"
          text={`Une autre question ? ${BRAND.contactEmail}`}
        />
        <div className="mx-auto max-w-[760px]">
          <DeferredFaqTabs groups={FAQ_GROUPS} />
        </div>
      </LandingSection>

      <LandingClosingCta />
    </div>
  );
}
