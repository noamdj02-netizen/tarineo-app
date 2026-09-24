import { Reveal, RevealGroup } from "@/components/motion/reveal";
import { Faq } from "@/components/site/faq";
import { DeferredPricing } from "@/components/site/landing-deferred";
import { JsonLd } from "@/components/site/json-ld";
import { siteMetadata } from "@/lib/seo";
import { breadcrumbJsonLd } from "@/lib/seo/json-ld";
import { FAQ } from "@/lib/site/content";

export const metadata = {
  title: "Prix",
  description: "7 jours d’essai Pro sans carte, puis Création 15 €, Pro 30 € ou Fondateur 149 €.",
  ...siteMetadata({
    title: "Prix Navpit",
    description: "7 jours d’essai Pro sans carte, puis Création 15 €, Pro 30 € ou Fondateur 149 €.",
    path: "/prix",
  }),
};

export default function PrixPage() {
  return (
    <div className="px-4 pt-12 pb-16 sm:px-8 sm:pt-20 sm:pb-20">
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Accueil", path: "/" },
          { name: "Prix", path: "/prix" },
        ])}
      />
      <RevealGroup className="mx-auto mb-12 flex max-w-[640px] flex-col items-center gap-3 text-center">
        <Reveal>
          <p className="mono-label">/ Prix ///</p>
        </Reveal>
        <Reveal>
          <h1 className="font-display text-[clamp(34px,6vw,56px)] leading-[1.02] font-semibold tracking-tightest text-balance">
            Création, Pro <span className="text-accent-2">ou Fondateur.</span>
          </h1>
        </Reveal>
        <Reveal>
          <p className="text-[16.5px] leading-relaxed text-muted-foreground">
            Essai Pro gratuit sans carte, puis Création à 15 € ou Pro à 30 € par mois — avec un prix qui baisse chaque
            année d’abonnement. Ou 149 € une fois pour Pro à vie.
          </p>
        </Reveal>
      </RevealGroup>
      <DeferredPricing />
      <div className="mx-auto mt-20 max-w-[720px]">
        <h2 className="mb-6 text-center font-display text-[28px] font-semibold tracking-tightest">
          Questions fréquentes
        </h2>
        <Faq items={FAQ} />
      </div>
    </div>
  );
}
