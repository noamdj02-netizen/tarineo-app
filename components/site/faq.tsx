"use client";

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
export function Faq({ items }: { items: FaqItem[] }) {
  return (
    <Card className="gap-0 rounded-2xl py-0 shadow-soft">
      <Accordion defaultValue={[panelId(items[0]?.q ?? "item", 0)]} className="px-1">
        {items.map((it, i) => {
          const id = panelId(it.q, i);
          return (
            <AccordionItem key={it.q} value={id} className="px-4 sm:px-5">
              <AccordionTrigger className="min-h-14 py-4 text-[15px] font-semibold hover:no-underline sm:text-base">
                {it.q}
              </AccordionTrigger>
              <AccordionContent className="text-[15px] leading-relaxed text-muted-foreground sm:text-base">
                {it.a}
              </AccordionContent>
            </AccordionItem>
          );
        })}
      </Accordion>
    </Card>
  );
}
