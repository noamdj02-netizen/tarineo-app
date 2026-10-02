import { JsonLd } from "@/components/site/json-ld";
import { LandingAtmosphere } from "@/components/site/landing-atmosphere";
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
import { LandingShowcase } from "@/components/site/landing-showcase";
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
    <LandingAtmosphere>
      <JsonLd data={[softwareApplicationJsonLd(), faqPageJsonLd()]} />

      <LandingHero />

      <LandingSection id="devis-ia" lead>
        <LandingSectionHead
          chapter="01"
          title="Créez et analysez vos devis avec l’IA."
          text="Document, saisie ou dictée — structurez un devis sans repartir de zéro."
        />
        <LandingShowcase>
          <DeferredProductDevisIa />
        </LandingShowcase>
      </LandingSection>

      <LandingSection id="documents">
        <LandingSectionHead
          chapter="02"
          title="Repérez les hausses sur vos documents fournisseurs."
          text="PDF ou photo : TARINEO extrait les lignes et compare à votre historique."
        />
        <LandingShowcase>
          <DeferredProductDocuments />
        </LandingShowcase>
      </LandingSection>

      <LandingSection id="chantiers">
        <LandingSectionHead
          chapter="03"
          title="Un chantier, tous vos documents."
          text="Devis, achats et marge dans le même contexte."
        />
        <LandingShowcase>
          <DeferredProductChantier />
        </LandingShowcase>
      </LandingSection>

      <LandingSection id="comment-ca-marche">
        <LandingSectionHead
          chapter="04"
          title="Devis, commande, facture — sans ressaisie."
          text="Les lignes suivent d’un document à l’autre."
        />
        <LandingShowcase>
          <DeferredProductPipeline />
        </LandingShowcase>
      </LandingSection>

      <LandingSection id="copilote">
        <LandingSectionHead
          chapter="05"
          title="Un copilote qui connaît vos chantiers."
          text="Posez une question, retrouvez l’info dans vos documents."
        />
        <LandingShowcase>
          <DeferredProductCopilote />
        </LandingShowcase>
      </LandingSection>

      <LandingSection id="fonctionnalites">
        <LandingSectionHead
          size="md"
          title="Les modules que vous utilisez au quotidien."
          text="Chaque carte renvoie vers la démo correspondante — le même écran que dans l’application."
        />
        <DeferredProductFeatures />
      </LandingSection>

      <LandingSection id="artisans">
        <LandingSectionHead
          size="md"
          title="Pour les artisans qui achètent en distributeur."
        />
        <LandingAudience />
      </LandingSection>

      <LandingSection id="qui">
        <LandingSectionHead
          size="md"
          title="Créé sur les chantiers,"
          tail="pas dans une incubatrice."
        />
        <LandingFounder />
      </LandingSection>

      <LandingSection id="tarifs" narrow>
        <LandingSectionHead
          align="center"
          title="1er mois offert, puis dès 17 € HT / mois."
          text="Sans carte bancaire à l’inscription. Sans engagement."
        />
        <DeferredPricing />
      </LandingSection>

      <LandingSection id="faq" narrow>
        <LandingSectionHead
          align="center"
          size="md"
          title="Questions fréquentes"
          text={`Autre sujet ? ${BRAND.contactEmail}`}
        />
        <DeferredFaqTabs groups={FAQ_GROUPS} />
      </LandingSection>

      <LandingClosingCta />
    </LandingAtmosphere>
  );
}
