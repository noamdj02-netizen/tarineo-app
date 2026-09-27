import { LandingCtaBand, LandingClosingCta } from "@/components/site/landing-cta";
import { LandingWorkspaceDepth } from "@/components/site/landing-folio-sections";
import { LandingProductShowcase } from "@/components/site/landing-product-showcase";
import { LandingFeatures } from "@/components/site/landing-features";
import {
  DeferredFaqTabs,
  DeferredPricing,
  DeferredProductFilm,
  DeferredTestimonials,
} from "@/components/site/landing-deferred";
import { LandingHero } from "@/components/site/landing-hero";
import { LandingMarquee } from "@/components/site/landing-marquee";
import { LandingSection, LandingSectionHead } from "@/components/site/landing-section";
import { ProductPreview } from "@/components/site/product-preview";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PRO_TRIAL_DAYS } from "@/lib/billing/plans";
import { JsonLd } from "@/components/site/json-ld";
import { BRAND } from "@/lib/brand";
import { siteMetadata } from "@/lib/seo";
import { faqPageJsonLd, softwareApplicationJsonLd } from "@/lib/seo/json-ld";
import { LandingSteps } from "@/components/site/landing-steps";
import { FAQ_GROUPS } from "@/lib/site/content";

const HOME_TITLE = `${BRAND.name} · Construis ton SaaS. Lance-le. Ne te disperse plus.`;
const HOME_DESCRIPTION =
  "Navpit regroupe tes side-projects et SaaS : un seul en Focus, la prochaine action, ressources design et copilote IA contextualisé.";

export const metadata = {
  title: { absolute: HOME_TITLE },
  description: HOME_DESCRIPTION,
  ...siteMetadata({ description: HOME_DESCRIPTION, path: "/" }),
};

export default function LandingPage() {
  return (
    <>
      <JsonLd data={[softwareApplicationJsonLd(), faqPageJsonLd()]} />
      <section id="commencer" className="relative isolate scroll-mt-24 overflow-x-clip bg-ink">
        <LandingHero />

        <LandingMarquee className="relative z-10 mt-10 sm:mt-12" />

        <div className="mx-auto mt-6 w-full max-w-[1160px] sm:mt-10">
          <ProductPreview />
        </div>
      </section>

      <LandingCtaBand />
      <LandingProductShowcase />
      <LandingWorkspaceDepth />

      <LandingSection id="film">
        <LandingSectionHead
          label="Téléphone"
          title="Rapide. Sûr. À toi."
          text="Le copilote, ton Focus et tes ressources — déjà dans ta poche."
        />
        <DeferredProductFilm />
      </LandingSection>

      <LandingSection id="fonctions" tone="muted">
        <LandingSectionHead
          label="Fonctions"
          title="Tout ce qu’il faut pour lancer,"
          tail="au même endroit."
          text="Fini les onglets Notion, Figma, ChatGPT et agenda éparpillés : Navpit réunit tout autour de tes projets."
        />
        <LandingFeatures />
      </LandingSection>

      <LandingSection id="comment">
        <LandingSectionHead label="Étapes" title="Trois étapes," tail="et tu avances." />
        <LandingSteps />
      </LandingSection>

      <LandingSection id="temoignages" className="bg-bg">
        <LandingSectionHead
          align="start"
          className="max-w-[1080px]"
          label="Témoignages"
          title="Fondateurs solo,"
          tail="ils avancent avec Navpit."
          text="Retours de créateurs qui ont remplacé le chaos d’onglets par un seul cockpit."
        />
        <DeferredTestimonials />
      </LandingSection>

      <LandingSection id="prix">
        <LandingSectionHead
          label="Prix"
          title="Essai Pro,"
          tail="puis la formule qui te va."
          text={`${PRO_TRIAL_DAYS} jours sans carte, puis Création à 15 € ou Pro à 30 € — ou Fondateur à 149 € une fois.`}
        />
        <DeferredPricing />
      </LandingSection>

      <LandingSection id="faq" tone="muted">
        <LandingSectionHead
          label="FAQ"
          title="Questions fréquentes"
          text="Tout ce qu’il faut savoir sur Navpit. Une autre question ? Écris-nous depuis ton compte."
        />
        <div className="mx-auto max-w-[720px]">
          <Card className="gap-0 rounded-[24px] border-line py-0 shadow-soft ring-1 ring-line">
            <CardHeader className="border-b border-line px-6 py-5 text-center">
              <CardTitle className="text-base font-semibold">Par thème</CardTitle>
              <CardDescription className="text-[14px]">Tarifs, confidentialité, annulation…</CardDescription>
            </CardHeader>
            <CardContent className="px-4 py-6 sm:px-6">
              <DeferredFaqTabs groups={FAQ_GROUPS} />
            </CardContent>
          </Card>
        </div>
      </LandingSection>

      <LandingClosingCta />
    </>
  );
}
