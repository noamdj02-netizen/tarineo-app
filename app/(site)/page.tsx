import { JsonLd } from "@/components/site/json-ld";
import { LandingAudience } from "@/components/site/landing-audience";
import { LandingChantiers } from "@/components/site/landing-chantiers";
import { LandingFeatureGrid } from "@/components/site/landing-feature-grid";
import { LandingClosingCta } from "@/components/site/landing-cta";
import {
  DeferredDashboard,
  DeferredDocument,
  DeferredFaqTabs,
  DeferredPricing,
  DeferredSuppliers,
} from "@/components/site/landing-deferred";
import { LandingFounder } from "@/components/site/landing-founder";
import { LandingHero } from "@/components/site/landing-hero";
import { LandingHow } from "@/components/site/landing-how";
import { LandingProblem } from "@/components/site/landing-problem";
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
    <>
      <JsonLd data={[softwareApplicationJsonLd(), faqPageJsonLd()]} />

      <LandingHero />
      <LandingProblem />
      <LandingHow />

      <LandingSection id="analyse" className="border-t border-line">
        <LandingSectionHead
          label="Analyse de document"
          title="Chaque ligne,"
          tail="comparée à ce que vous payiez avant."
          text="TARINEO lit le document, retrouve chaque produit dans votre historique et met en évidence ce qui a bougé."
        />
        <DeferredDocument />
      </LandingSection>

      <LandingSection id="tableau-de-bord" className="border-t border-line bg-[#070707]">
        <LandingSectionHead
          label="Tableau de bord"
          title="Vos prix fournisseurs,"
          tail="sur un seul tableau de bord."
          text="Documents analysés, hausses détectées, impact estimé : l’essentiel en un coup d’œil, sans tableur."
        />
        <DeferredDashboard />
      </LandingSection>

      <LandingSection id="chantiers" className="border-t border-line">
        <LandingSectionHead
          label="Chantiers"
          title="Tous vos documents,"
          tail="rangés par chantier."
          text="Achats, devis client, facture : chaque document est rattaché à son chantier, avec l’étape en cours et votre marge."
        />
        <LandingChantiers />
      </LandingSection>

      <LandingSection id="fournisseurs" className="border-t border-line">
        <LandingSectionHead
          label="Fournisseurs"
          title="Une vision claire"
          tail="de vos achats."
          text="Classez vos achats par fournisseur et repérez ceux dont les prix augmentent le plus."
        />
        <DeferredSuppliers />
      </LandingSection>

      <LandingSection id="fonctionnalites" className="border-t border-line">
        <LandingSectionHead
          label="Dans l’app"
          title="Tout ce que fait TARINEO,"
          tail="déjà disponible."
          text="Des achats fournisseurs jusqu’au devis de votre client : les outils livrés aujourd’hui dans l’application."
        />
        <LandingFeatureGrid />
      </LandingSection>

      <LandingSection id="pour-qui" tone="light">
        <LandingSectionHead
          label="Pour qui"
          title="Pensé pour ceux"
          tail="qui construisent."
          text="Artisans et petites entreprises du bâtiment qui achètent chez plusieurs fournisseurs."
        />
        <LandingAudience />
      </LandingSection>

      <LandingSection id="qui" className="border-t border-line">
        <LandingSectionHead label="Qui est derrière" title="Un ancien des chantiers," tail="pas une start-up hors-sol." />
        <LandingFounder />
      </LandingSection>

      <LandingSection id="tarifs" className="border-t border-line">
        <LandingSectionHead
          label="Tarifs"
          title="Le 1er mois est offert."
          tail="Ensuite, dès 17 € par mois."
        />
        <DeferredPricing />
      </LandingSection>

      <LandingSection id="faq" tone="light">
        <LandingSectionHead
          label="FAQ"
          title="Questions fréquentes"
          text={`Une autre question ? Écrivez-nous : ${BRAND.contactEmail}`}
        />
        <div className="mx-auto max-w-[760px]">
          <DeferredFaqTabs groups={FAQ_GROUPS} />
        </div>
      </LandingSection>

      <LandingClosingCta />
    </>
  );
}
