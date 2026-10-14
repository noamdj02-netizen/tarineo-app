import { Faq } from "@/components/site/faq";
import { Pricing } from "@/components/site/landing-v2/sections/Pricing";
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
    <div className="landing-v2 theme-light isolate min-h-dvh bg-[#f0f0f0] px-4 pb-16 pt-6 text-ink-900 sm:px-8 sm:pb-20 sm:pt-10">
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Accueil", path: "/" },
          { name: "Tarifs", path: "/prix" },
        ])}
      />
      <Pricing showFooterLink={false} />
      <div className="shell mx-auto mt-20 max-w-[720px]">
        <h2 className="mb-6 text-center text-[28px] font-semibold tracking-[-0.03em] text-ink-900">
          Questions fréquentes
        </h2>
        <Faq items={FAQ} />
      </div>
    </div>
  );
}
