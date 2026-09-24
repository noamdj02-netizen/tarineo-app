import { Reveal, RevealGroup } from "@/components/motion/reveal";
import { Faq } from "@/components/site/faq";
import { Pricing } from "@/components/site/pricing";
import { FAQ } from "@/lib/site/content";

export const metadata = {
  title: "Prix",
  description: "Gratuit pour commencer. En Pro, ton prix baisse chaque année où tu restes abonné.",
};

export default function PrixPage() {
  return (
    <div className="px-5 pt-14 pb-20 sm:px-8 sm:pt-20">
      <RevealGroup className="mx-auto mb-12 flex max-w-[640px] flex-col items-center gap-3 text-center">
        <Reveal>
          <p className="mono-label">/ Prix ///</p>
        </Reveal>
        <Reveal>
          <h1 className="font-display text-[clamp(34px,6vw,56px)] leading-[1.02] font-semibold tracking-tightest text-balance">
            Plus tu restes, <span className="text-accent-2">moins tu paies.</span>
          </h1>
        </Reveal>
        <Reveal>
          <p className="text-[16.5px] leading-relaxed text-muted">
            Commence gratuitement. En Pro, ton prix baisse tout seul à chaque anniversaire
            d’abonnement, jusqu’à 40 % de moins.
          </p>
        </Reveal>
      </RevealGroup>
      <div className="mx-auto max-w-[1080px]">
        <Pricing />
      </div>
      <div className="mx-auto mt-20 max-w-[720px]">
        <h2 className="mb-6 text-center font-display text-[28px] font-semibold tracking-tightest">
          Questions fréquentes
        </h2>
        <Faq items={FAQ} />
      </div>
    </div>
  );
}
