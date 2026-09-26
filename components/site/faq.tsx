"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Plus } from "lucide-react";
import { useState } from "react";
import { EASE } from "@/components/motion/reveal";
import { cn } from "@/lib/utils";

export type FaqItem = { q: string; a: string };

function panelId(question: string, index: number) {
  const slug = question
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40);
  return `faq-${index}-${slug || "item"}`;
}

/** Accordéon : une seule réponse ouverte à la fois, hauteur animée. */
export function Faq({ items }: { items: FaqItem[] }) {
  const [open, setOpen] = useState<number | null>(0);
  return (
    <div className="flex flex-col gap-2">
      {items.map((it, i) => {
        const isOpen = open === i;
        const id = panelId(it.q, i);
        return (
          <article key={it.q} className="rounded-[18px] border border-line bg-surface shadow-soft">
            <button
              type="button"
              aria-expanded={isOpen}
              aria-controls={id}
              onClick={() => setOpen(isOpen ? null : i)}
              className="flex min-h-14 w-full items-center justify-between gap-4 px-5 text-left text-[15.5px] font-medium"
            >
              <span>{it.q}</span>
              <Plus
                aria-hidden
                className={cn(
                  "size-4 flex-none transition-transform duration-300 ease-out-soft",
                  isOpen && "rotate-45",
                )}
              />
            </button>
            <AnimatePresence initial={false}>
              {isOpen ? (
                <motion.div
                  id={id}
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3, ease: EASE }}
                  className="overflow-hidden"
                >
                  <p className="px-5 pb-5 text-[14.5px] leading-relaxed text-muted-foreground">{it.a}</p>
                </motion.div>
              ) : null}
            </AnimatePresence>
          </article>
        );
      })}
    </div>
  );
}
