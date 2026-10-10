"use client";

import { useEffect, useState } from "react";
import { ChevronDown } from "lucide-react";

import { FinalCtaCard } from "@/components/site/landing-v2/sections/FinalCta";
import { faqItems } from "@/lib/site/landing-v2-content";
import { LandingSection } from "@/components/site/landing-v2/components/layout/LandingSection";
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

/** FAQ Launch UI — titre centré + accordéon étroit. */
export function FaqFinal() {
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => setHydrated(true), []);

  const firstId = panelId(faqItems[0]?.q ?? "item", 0);

  return (
    <LandingSection id="faq" className="border-t border-line pb-8 sm:pb-12">
      <div className="shell">
        <h2 className="mx-auto max-w-xl text-center text-title font-semibold tracking-tight text-ink-900">
          Questions et réponses
        </h2>

        <div className="mx-auto mt-10 max-w-2xl sm:mt-12">
          {hydrated ? (
            <Accordion defaultValue={[firstId]} className="w-full">
              {faqItems.map((it, i) => {
                const id = panelId(it.q, i);
                return (
                  <AccordionItem
                    key={id}
                    value={id}
                    className="border-b border-ink-900/10"
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
                    <AccordionContent className="pb-4 text-sm leading-relaxed text-ink-500 sm:text-base">
                      {it.a}
                    </AccordionContent>
                  </AccordionItem>
                );
              })}
            </Accordion>
          ) : (
            <div className="divide-y divide-ink-900/10 border-y border-ink-900/10">
              {faqItems.map((it, i) => (
                <details key={panelId(it.q, i)} className="group" open={i === 0}>
                  <summary className="flex min-h-12 cursor-pointer list-none items-center justify-between gap-3 py-4 text-left text-base font-medium text-ink-900 marker:content-none [&::-webkit-details-marker]:hidden">
                    <span className="flex-1 pe-2">{it.q}</span>
                    <ChevronDown className="size-4 shrink-0 text-ink-400 group-open:rotate-180" aria-hidden />
                  </summary>
                  <p className="pb-4 text-sm leading-relaxed text-ink-500 sm:text-base">{it.a}</p>
                </details>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="shell mt-16 sm:mt-20">
        <FinalCtaCard />
      </div>
    </LandingSection>
  );
}
