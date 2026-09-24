import { ArrowRight, Check } from "lucide-react";
import { Illustration } from "@/components/illustration";
import { Reveal, RevealGroup } from "@/components/motion/reveal";
import { LandingButton } from "@/components/site/landing-button";
import { LandingFaqTabs } from "@/components/site/landing-faq-tabs";
import {
  LandingCtaBand,
  LandingHowItWorks,
  LandingWorkspaceDepth,
} from "@/components/site/landing-folio-sections";
import { LandingMarquee } from "@/components/site/landing-marquee";
import { LandingSection, LandingSectionHead } from "@/components/site/landing-section";
import { HeroPrompt } from "@/components/site/hero-prompt";
import { InView } from "@/components/site/in-view";
import { Pricing } from "@/components/site/pricing";
import { ProductPreview } from "@/components/site/product-preview";
import { Card, CardContent } from "@/components/ui/card";
import { JsonLd } from "@/components/site/json-ld";
import { BRAND } from "@/lib/brand";
import { siteMetadata } from "@/lib/seo";
import { faqPageJsonLd, softwareApplicationJsonLd } from "@/lib/seo/json-ld";
import { FAQ_GROUPS, FEATURES, STEPS } from "@/lib/site/content";

const HOME_TITLE = `${BRAND.name} · Cockpit fondateur solo, un projet en Focus & copilote IA`;
const HOME_DESCRIPTION =
  "Navpit regroupe tes side-projects et SaaS : un seul en Focus, la prochaine action, ressources design et copilote IA contextualisé. Gratuit pour commencer.";

export const metadata = {
  title: { absolute: HOME_TITLE },
  description: HOME_DESCRIPTION,
  ...siteMetadata({ description: HOME_DESCRIPTION, path: "/" }),
};

const PROOF = ["Gratuit pour commencer", "Sans carte bancaire", "Tes données restent à toi"];

export default function LandingPage() {
  return (
    <>
      <JsonLd data={[softwareApplicationJsonLd(), faqPageJsonLd()]} />
      <section
        id="commencer"
        className="relative isolate -mt-[72px] scroll-mt-24 overflow-clip px-5 pt-[120px] pb-8 sm:px-8 sm:pt-[128px]"
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

        <RevealGroup className="mx-auto flex w-full max-w-[860px] flex-col items-center gap-6 text-center">
          <Reveal>
            <p className="mono-label">/ Cockpit fondateur ///</p>
          </Reveal>
          <Reveal>
            <h1 className="font-display text-[clamp(40px,7.4vw,76px)] leading-[0.98] font-semibold tracking-tightest text-balance">
              Tous tes projets. <span className="text-accent-2">Un seul en Focus.</span>
            </h1>
          </Reveal>
          <Reveal>
            <p className="max-w-[56ch] text-[17px] leading-relaxed text-muted-foreground sm:text-[18px]">
              {BRAND.description}
            </p>
          </Reveal>
          <Reveal className="flex flex-wrap justify-center gap-3">
            <LandingButton href="/inscription" icon={<ArrowRight aria-hidden />}>
              Commencer gratuitement
            </LandingButton>
            <LandingButton href="/#solution" variant="secondary">
              Voir le produit
            </LandingButton>
          </Reveal>
          <Reveal className="mt-1 w-full max-w-[680px]">
            <HeroPrompt />
          </Reveal>
          <Reveal>
            <ul className="flex flex-wrap justify-center gap-x-5 gap-y-2 text-[13.5px] text-muted-foreground">
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

        <div className="mx-auto mt-8 max-w-[1160px] sm:mt-10">
          <ProductPreview />
        </div>
      </section>

      <LandingCtaBand />
      <LandingHowItWorks />
      <LandingWorkspaceDepth />

      <LandingSection id="fonctions" tone="muted">
        <LandingSectionHead
          label="Fonctions"
          title="Tout ce qu’il faut pour lancer,"
          tail="au même endroit."
          text="Fini les onglets Notion, Figma, ChatGPT et agenda éparpillés : Navpit réunit tout autour de tes projets."
        />
        <InView className="mx-auto grid max-w-[1080px] gap-4 sm:grid-cols-2 lg:grid-cols-3" stagger={0.06}>
          {FEATURES.map((f) => (
            <Reveal key={f.title}>
              <Card className="h-full gap-0 rounded-[22px] border-border py-0 shadow-soft ring-0">
                <CardContent className="flex flex-col gap-3 p-6">
                  <Illustration name={f.art} className="-mt-1 -ml-1 size-16" label={f.title} />
                  <h3 className="text-lg font-semibold tracking-tight">{f.title}</h3>
                  <p className="text-[14.5px] leading-relaxed text-muted-foreground">{f.text}</p>
                </CardContent>
              </Card>
            </Reveal>
          ))}
        </InView>
      </LandingSection>

      <LandingSection id="comment">
        <LandingSectionHead label="Étapes" title="Trois étapes," tail="et tu avances." />
        <InView className="mx-auto grid max-w-[1080px] gap-4 md:grid-cols-3">
          {STEPS.map((s, i) => (
            <Reveal key={s.title}>
              <Card className="h-full gap-0 rounded-[22px] border-transparent py-0 shadow-soft ring-0">
                <CardContent className="flex flex-col gap-3 p-6">
                  <span className="font-mono text-xs font-medium tracking-widest text-muted-foreground">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <h3 className="text-lg font-semibold tracking-tight">{s.title}</h3>
                  <p className="text-[14.5px] leading-relaxed text-muted-foreground">{s.text}</p>
                </CardContent>
              </Card>
            </Reveal>
          ))}
        </InView>
      </LandingSection>

      <LandingSection tone="muted">
        <InView className="mx-auto flex max-w-[760px] flex-col items-center gap-6 text-center">
          <Reveal>
            <Illustration name="landing-idee" className="size-20" label="Illustration fondateur" />
          </Reveal>
          <Reveal>
            <blockquote className="font-serif text-[clamp(24px,3.6vw,34px)] leading-[1.25] text-balance italic">
              « J’avais dix projets ouverts et aucun ne sortait. Navpit, c’est la règle que je me suis
              imposée : un seul en Focus, jusqu’à la première vente. »
            </blockquote>
          </Reveal>
          <Reveal>
            <p className="mono-label">Noam · Créateur de Navpit</p>
          </Reveal>
        </InView>
      </LandingSection>

      <LandingSection id="prix">
        <LandingSectionHead
          label="Prix"
          title="Plus tu restes,"
          tail="moins tu paies."
          text="Commence gratuitement. En Pro, ton prix baisse à chaque anniversaire d’abonnement."
        />
        <div className="mx-auto max-w-[1080px]">
          <Pricing />
        </div>
      </LandingSection>

      <LandingSection id="faq" tone="muted">
        <LandingSectionHead
          label="FAQ"
          title="Questions fréquentes"
          text="Tout ce qu’il faut savoir sur Navpit. Une autre question ? Écris-nous depuis ton compte."
        />
        <div className="mx-auto max-w-[720px]">
          <LandingFaqTabs groups={FAQ_GROUPS} />
        </div>
      </LandingSection>

      <section className="px-5 pb-20 sm:px-8">
        <InView className="relative isolate mx-auto flex max-w-[1080px] flex-col items-center gap-5 overflow-clip rounded-[28px] bg-ink px-6 py-16 text-center text-accent-ink shadow-lift">
          <Reveal>
            <h2 className="font-display text-[clamp(28px,4.6vw,46px)] leading-[1.04] font-semibold tracking-tightest text-balance">
              Prêt à lancer ton prochain projet ?
            </h2>
          </Reveal>
          <Reveal>
            <p className="max-w-[48ch] text-base leading-relaxed text-accent-ink/70">
              Crée ton compte en une minute, ajoute tes projets et choisis ton Focus.
            </p>
          </Reveal>
          <Reveal>
            <LandingButton href="/inscription" variant="inverse" icon={<ArrowRight aria-hidden />}>
              Commencer gratuitement
            </LandingButton>
          </Reveal>
        </InView>
      </section>
    </>
  );
}
