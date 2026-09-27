import Link from "next/link";
import { LandingCtaBand } from "@/components/site/landing-cta";
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
        <div className="mx-auto grid max-w-[1080px] gap-10 lg:grid-cols-[minmax(0,0.88fr)_minmax(0,1.22fr)] lg:items-start lg:gap-14">
          <div className="lg:sticky lg:top-28">
            <LandingSectionHead
              align="start"
              className="mx-0 mb-6 max-w-none sm:mb-7"
              label="FAQ"
              title="Les questions qu’on te pose,"
              tail="avant de commencer."
              text="Essai, tarifs, données. Les retours fondateurs sont sur Avis."
            />
            <div className="flex flex-col items-start gap-3">
              <Link
                href="/avis"
                className="text-[14.5px] text-foreground underline underline-offset-4 hover:text-muted-foreground"
              >
                Lire les avis fondateurs
              </Link>
              <Link
                href="/prix"
                className="text-[14.5px] text-foreground underline underline-offset-4 hover:text-muted-foreground"
              >
                Comparer Création, Pro et Fondateur
              </Link>
              <p className="max-w-[40ch] text-[13.5px] leading-relaxed text-muted-foreground">
                Une autre question ? Écris-nous depuis ton compte une fois connecté.
              </p>
            </div>
          </div>
          <DeferredFaqTabs groups={FAQ_GROUPS} />
        </div>
      </LandingSection>

    </>
  );
}
