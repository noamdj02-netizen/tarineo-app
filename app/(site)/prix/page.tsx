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
    <div className="px-4 pb-16 pt-10 sm:px-8 sm:pb-20 sm:pt-14">
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Accueil", path: "/" },
          { name: "Tarifs", path: "/prix" },
        ])}
      />
      <RevealGroup className="mx-auto mb-12 flex max-w-[640px] flex-col items-center gap-3 text-center">
        <Reveal>
          <p className="text-[12px] font-semibold uppercase tracking-[0.14em] text-tarineo-orange">
            Tarifs
          </p>
        </Reveal>
        <Reveal>
          <h1 className="text-balance text-[clamp(2rem,5vw,3.25rem)] font-semibold leading-[1.05] tracking-[-0.03em] text-ink-900">
            Simple et <span className="text-ink-400">sans engagement.</span>
          </h1>
        </Reveal>
        <Reveal>
          <p className="text-[16.5px] leading-relaxed text-ink-500">{PRIX_DESCRIPTION}</p>
        </Reveal>
      </RevealGroup>
      <DeferredPricing />
      <div className="mx-auto mt-20 max-w-[720px]">
        <h2 className="mb-6 text-center text-[28px] font-semibold tracking-[-0.03em] text-ink-900">
          Questions fréquentes
        </h2>
        <Faq items={FAQ} />
      </div>
    </div>
  );
}
