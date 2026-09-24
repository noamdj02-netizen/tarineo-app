import { ArrowRight, Check } from "lucide-react";
import { Reveal, RevealGroup } from "@/components/motion/reveal";
import { BrandFocus } from "@/components/site/brand-focus";
import { LandingButton } from "@/components/site/landing-button";
import { LandingCtaBand, LandingClosingCta } from "@/components/site/landing-cta";
import { LandingWorkspaceDepth } from "@/components/site/landing-folio-sections";
import { LandingProductShowcase } from "@/components/site/landing-product-showcase";
import { LandingFeatures } from "@/components/site/landing-features";
import { DeferredFaqTabs, DeferredPricing, DeferredTestimonials } from "@/components/site/landing-deferred";
import { LandingMarquee } from "@/components/site/landing-marquee";
import { LandingSection, LandingSectionHead } from "@/components/site/landing-section";
import { HeroPrompt } from "@/components/site/hero-prompt";
import { ProductPreview } from "@/components/site/product-preview";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PRO_TRIAL_DAYS } from "@/lib/billing/plans";
import { JsonLd } from "@/components/site/json-ld";
import { BRAND } from "@/lib/brand";
import { siteMetadata } from "@/lib/seo";
import { faqPageJsonLd, softwareApplicationJsonLd } from "@/lib/seo/json-ld";
import { LandingSteps } from "@/components/site/landing-steps";
import { FAQ_GROUPS } from "@/lib/site/content";

const HOME_TITLE = `${BRAND.name} · Cockpit fondateur solo, un projet en Focus & copilote IA`;
const HOME_DESCRIPTION =
  "Navpit regroupe tes side-projects et SaaS : un seul en Focus, la prochaine action, ressources design et copilote IA contextualisé.";

export const metadata = {
  title: { absolute: HOME_TITLE },
  description: HOME_DESCRIPTION,
  ...siteMetadata({ description: HOME_DESCRIPTION, path: "/" }),
};

const PROOF = [
  `${PRO_TRIAL_DAYS} jours d’essai sans carte`,
  "Prix qui baisse chaque année",
  "Tes données restent à toi",
];

export default function LandingPage() {
  return (
    <>
      <JsonLd data={[softwareApplicationJsonLd(), faqPageJsonLd()]} />
      <section
        id="commencer"
        className="relative isolate -mt-[72px] scroll-mt-24 overflow-clip px-4 pt-[108px] pb-6 sm:px-8 sm:pt-[128px] sm:pb-8"
      >
        <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
          {/* Fond coloré hero : lisible derrière le titre + la prompt box */}
          <div
            className="absolute inset-x-[-12%] top-[8%] bottom-[-20%] rounded-[48%] opacity-[0.92] blur-3xl"
            style={{
              background:
                "radial-gradient(ellipse 85% 70% at 50% 72%, color-mix(in srgb, var(--color-glow-2) 55%, transparent) 0%, transparent 68%)",
            }}
          />
          <div className="absolute inset-x-[-20%] bottom-[-40%] h-[100%] rounded-[50%] bg-[radial-gradient(closest-side,var(--color-glow-2)_0%,transparent_72%)] opacity-100 blur-2xl" />
          <div className="absolute bottom-[-28%] left-[-12%] h-[85%] w-[72%] animate-[glow-drift_20s_ease-in-out_infinite] rounded-full bg-[radial-gradient(closest-side,var(--color-glow-1)_22%,transparent_70%)] opacity-95 blur-3xl" />
          <div className="absolute right-[-12%] bottom-[-28%] h-[85%] w-[72%] animate-[glow-drift_24s_ease-in-out_-9s_infinite] rounded-full bg-[radial-gradient(closest-side,var(--color-glow-3)_22%,transparent_70%)] opacity-95 blur-3xl" />
        </div>

        <RevealGroup className="mx-auto flex w-full max-w-[860px] flex-col items-center gap-5 text-center sm:gap-6">
          <Reveal>
            <p className="mono-label">/ Cockpit fondateur ///</p>
          </Reveal>
          <Reveal>
            <h1 className="font-display text-[clamp(32px,8.2vw,76px)] leading-[1.02] font-semibold tracking-tightest text-balance">
              Tous tes projets.{" "}
              <span className="text-muted-foreground">
                Un seul en <BrandFocus />.
              </span>
            </h1>
          </Reveal>
          <Reveal>
            <p className="max-w-[56ch] text-[16px] leading-relaxed text-muted-foreground sm:text-[18px]">
              {BRAND.description}
            </p>
          </Reveal>
          <Reveal className="flex w-full max-w-[min(100%,360px)] flex-col gap-2.5 sm:max-w-none sm:flex-row sm:flex-wrap sm:justify-center sm:gap-3">
            <LandingButton
              href="/inscription?plan=pro"
              icon={<ArrowRight aria-hidden />}
              fullWidth
              className="sm:w-auto sm:max-w-none"
            >
              Essai gratuit {PRO_TRIAL_DAYS} jours
            </LandingButton>
            <LandingButton href="/#solution" variant="secondary" fullWidth className="sm:w-auto sm:max-w-none">
              Voir le produit
            </LandingButton>
          </Reveal>
          <Reveal className="mt-1 w-full max-w-[680px]">
            <HeroPrompt />
          </Reveal>
          <Reveal>
            <ul className="flex flex-col items-center gap-2 text-[13px] text-muted-foreground sm:flex-row sm:flex-wrap sm:justify-center sm:gap-x-5 sm:gap-y-2 sm:text-[13.5px]">
              {PROOF.map((p) => (
                <li key={p} className="flex items-center gap-1.5">
                  <Check className="size-3.5 text-st-focus" aria-hidden />
                  {p}
                </li>
              ))}
            </ul>
          </Reveal>
        </RevealGroup>

        <LandingMarquee className="relative z-10 mt-10 sm:mt-12" />

        <div className="mx-auto mt-6 w-full max-w-[1160px] sm:mt-10">
          <ProductPreview />
        </div>
      </section>

      <LandingCtaBand />
      <LandingProductShowcase />
      <LandingWorkspaceDepth />

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
