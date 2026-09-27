import { Reveal, RevealGroup } from "@/components/motion/reveal";
import { Faq } from "@/components/site/faq";
import { DeferredPricing } from "@/components/site/landing-deferred";
import { JsonLd } from "@/components/site/json-ld";
import { BRAND } from "@/lib/brand";
import { siteMetadata } from "@/lib/seo";
import { breadcrumbJsonLd } from "@/lib/seo/json-ld";
import { FAQ, OFFER, PRICING, euroInt } from "@/lib/site/tarineo";

const PRIX_DESCRIPTION = `${OFFER}. Puis ${PRICING.map((p) => `${p.name} à ${euroInt(p.month)}`).join(", ")} HT par mois. Sans engagement.`;

export const metadata = {
  title: "Tarifs",
  description: PRIX_DESCRIPTION,
  ...siteMetadata({
    title: `Tarifs ${BRAND.name}`,
    description: PRIX_DESCRIPTION,
    path: "/prix",
  }),
};

export default function PrixPage() {
  return (
    <div className="px-4 pt-14 pb-16 sm:px-8 sm:pt-24 sm:pb-20">
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Accueil", path: "/" },
          { name: "Tarifs", path: "/prix" },
        ])}
      />
      <RevealGroup className="mx-auto mb-12 flex max-w-[640px] flex-col items-center gap-3 text-center">
        <Reveal>
          <p className="mono-label">/ Tarifs ///</p>
        </Reveal>
        <Reveal>
          <h1 className="font-display text-[clamp(34px,6vw,56px)] leading-[1.02] font-semibold tracking-tightest text-balance">
            Simple et <span className="text-muted-foreground">sans engagement.</span>
          </h1>
        </Reveal>
        <Reveal>
          <p className="text-[16.5px] leading-relaxed text-muted-foreground">{PRIX_DESCRIPTION}</p>
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
