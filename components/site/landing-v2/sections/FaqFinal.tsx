"use client";

import { useEffect, useState } from "react";
import { ChevronDown } from "lucide-react";

import { FinalCtaCard } from "@/components/site/landing-v2/sections/FinalCta";
import { faqItems } from "@/lib/site/landing-v2-content";
import { LandingSection } from "@/components/site/landing-v2/components/layout/LandingSection";
import { LandingFigmaSectionHeader } from "@/components/site/landing-v2/components/ui/LandingFigmaSectionHeader";
import { LANDING_CARD_SHADOW, LandingSurface } from "@/components/site/landing-v2/components/ui/LandingSurface";
import { cn } from "@/lib/utils";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

function panelId(question: string, index: number) {
  const slug = question
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40);
  return `faq-${index}-${slug || "item"}`;
}

/** FAQ + CTA final — panneau Parcours. */
export function FaqFinal() {
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => setHydrated(true), []);

  const firstId = panelId(faqItems[0]?.q ?? "item", 0);

  return (
    <LandingSection id="faq" className="pb-16 sm:pb-24">
      <div className="shell flex flex-col gap-10 sm:gap-14">
        <LandingSurface contentClassName="mx-auto flex max-w-[720px] flex-col items-center gap-10 sm:gap-12">
          <LandingFigmaSectionHeader
            align="center"
            badge="FAQ"
            title="Questions et réponses"
            subtitle="Ce qu’il faut savoir avant de démarrer — sans jargon."
          />

          <div
            className={cn(
              "w-full overflow-hidden rounded-[24px] border border-black/[0.04] bg-paper-0 px-4 sm:px-6",
              LANDING_CARD_SHADOW,
            )}
          >
            {hydrated ? (
              <Accordion defaultValue={[firstId]} className="w-full">
                {faqItems.map((it, i) => {
                  const id = panelId(it.q, i);
                  return (
                    <AccordionItem
                      key={id}
                      value={id}
                      className="border-b border-black/[0.06] last:border-b-0"
                    >
                      <AccordionTrigger
                        className={cn(
                          "min-h-12 gap-3 rounded-none py-4 text-left text-base font-medium text-ink-900 hover:no-underline",
                          "**:data-[slot=accordion-trigger-icon]:hidden",
                        )}
                      >
                        <span className="flex-1 pe-2">{it.q}</span>
                        <ChevronDown
                          className="size-4 shrink-0 text-ink-400 transition-transform duration-200 group-aria-expanded/accordion-trigger:rotate-180"
                          aria-hidden
                        />
                      </AccordionTrigger>
                      <AccordionContent className="pb-4 text-sm font-medium leading-relaxed text-ink-500 sm:text-base">
                        {it.a}
                      </AccordionContent>
                    </AccordionItem>
                  );
                })}
              </Accordion>
            ) : (
              <div className="divide-y divide-black/[0.06]">
                {faqItems.map((it, i) => (
                  <details key={panelId(it.q, i)} className="group" open={i === 0}>
                    <summary className="flex min-h-12 cursor-pointer list-none items-center justify-between gap-3 py-4 text-left text-base font-medium text-ink-900 marker:content-none [&::-webkit-details-marker]:hidden">
                      <span className="flex-1 pe-2">{it.q}</span>
                      <ChevronDown
                        className="size-4 shrink-0 text-ink-400 group-open:rotate-180"
                        aria-hidden
                      />
                    </summary>
                    <p className="pb-4 text-sm font-medium leading-relaxed text-ink-500 sm:text-base">
                      {it.a}
                    </p>
                  </details>
                ))}
              </div>
            )}
          </div>
        </LandingSurface>

        <FinalCtaCard />
      </div>
    </LandingSection>
  );
}
