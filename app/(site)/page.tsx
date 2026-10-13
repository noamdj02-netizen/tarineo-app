import { JsonLd } from "@/components/site/json-ld";
import { Faq } from "@/components/site/faq";
import { LandingChantiers } from "@/components/site/landing-chantiers";
import { LandingClosingCta } from "@/components/site/landing-cta";
import { LandingFeatureGrid, LandingIncluded, LandingSuivi } from "@/components/site/landing-feature-grid";
import { LandingHero } from "@/components/site/landing-hero";
import { LandingHow } from "@/components/site/landing-how";
import { LandingPricing } from "@/components/site/landing-pricing";
import { LandingSection, LandingSectionHead } from "@/components/site/landing-section";
import { BRAND } from "@/lib/brand";
import { siteMetadata } from "@/lib/seo";
import { faqPageJsonLd, softwareApplicationJsonLd } from "@/lib/seo/json-ld";
import { FAQ, OFFER } from "@/lib/site/tarineo";

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
      <LandingHow />
      <LandingChantiers />
      <LandingFeatureGrid />
      <LandingIncluded />
      <LandingSuivi />

      <LandingSection id="tarifs">
        <LandingSectionHead
          label="Tarifs"
          title="Tarifs mensuels HT"
          text={`${OFFER}, sur toutes les formules. Prix HT, sans engagement.`}
        />
        <LandingPricing />
      </LandingSection>

      <LandingSection id="faq">
        <LandingSectionHead
          label="FAQ"
          title="Questions fréquentes"
          text={`Une autre question ? Écrivez-nous : ${BRAND.contactEmail}`}
        />
        <div className="mx-auto max-w-[1180px]">
          <Faq items={FAQ} />
        </div>
      </LandingSection>

      <LandingClosingCta />
    </>
  );
}
