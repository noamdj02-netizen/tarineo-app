"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Card } from "@/components/ui/card";

export type FaqItem = { q: string; a: string };

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

/** Accordéon shadcn dans une Card. */
export function Faq({
  items,
  cardClassName,
  contentClassName,
}: {
  items: FaqItem[];
  cardClassName?: string;
  contentClassName?: string;
}) {
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => setHydrated(true), []);

  const answerClass = cn(
    "text-[15px] leading-relaxed text-muted-foreground sm:text-base",
    contentClassName,
  );

  return (
    <Card className={cn("gap-0 rounded-2xl py-0 shadow-soft", cardClassName)}>
      {hydrated ? (
        <Accordion defaultValue={[panelId(items[0]?.q ?? "item", 0)]} className="px-1">
          {items.map((it, i) => {
            const id = panelId(it.q, i);
            return (
              <AccordionItem key={id} value={id} className="px-4 sm:px-5">
                <AccordionTrigger className="min-h-11 py-4 text-left text-[15px] font-semibold hover:no-underline focus-visible:ring-2 focus-visible:ring-accent/40 sm:min-h-14 sm:text-base">
                  {it.q}
                </AccordionTrigger>
                <AccordionContent className={answerClass}>{it.a}</AccordionContent>
              </AccordionItem>
            );
          })}
        </Accordion>
      ) : (
        <div className="divide-y divide-line px-1">
          {items.map((it, i) => (
            <details key={panelId(it.q, i)} className="group px-4 sm:px-5" open={i === 0}>
              <summary className="min-h-11 cursor-pointer list-none py-4 text-left text-[15px] font-semibold marker:content-none sm:min-h-14 sm:text-base [&::-webkit-details-marker]:hidden">
                {it.q}
              </summary>
              <p className={cn("pb-4", answerClass)}>{it.a}</p>
            </details>
          ))}
        </div>
      )}
    </Card>
  );
}
