"use client";

import { Faq } from "@/components/site/faq";
import { FinalCtaCard } from "@/components/site/landing-v2/sections/FinalCta";
import { faqItems } from "@/lib/site/landing-v2-content";
import { LandingSection } from "@/components/site/landing-v2/components/layout/LandingSection";
import { landingCardClass } from "@/components/site/landing-v2/components/ui/landing-card";
import { SectionHeading } from "@/components/site/landing-v2/components/ui/SectionLabel";

export function FaqFinal() {
  return (
    <LandingSection id="faq" className="border-t border-line pb-24 sm:pb-32">
      <div className="shell max-w-3xl">
        <SectionHeading label="FAQ" title="Questions fréquentes" />

        <div className="mt-10">
          <Faq
            items={faqItems}
            cardClassName={landingCardClass("shadow-card ring-line/80")}
            contentClassName="text-ink-600"
          />
        </div>
      </div>

      <div className="shell mt-16">
        <FinalCtaCard />
      </div>
    </LandingSection>
  );
}
