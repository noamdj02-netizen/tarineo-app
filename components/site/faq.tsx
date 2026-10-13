"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

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

/** Accordéon pleine largeur, style Figma. */
export function Faq({ items }: { items: FaqItem[] }) {
  return (
    <Accordion defaultValue={[panelId(items[0]?.q ?? "item", 0)]} className="flex flex-col gap-3">
      {items.map((it, i) => {
        const id = panelId(it.q, i);
        return (
          <AccordionItem
            key={it.q}
            value={id}
            className="rounded-[22px] border border-line bg-white px-4 shadow-soft not-last:border-b-0 sm:px-5"
          >
            <AccordionTrigger className="min-h-16 py-4 text-left text-[16px] font-semibold hover:no-underline sm:text-[18px]">
              {it.q}
            </AccordionTrigger>
            <AccordionContent className="pb-5 text-[15px] leading-relaxed text-muted-foreground sm:text-base">
              {it.a}
            </AccordionContent>
          </AccordionItem>
        );
      })}
    </Accordion>
  );
}
