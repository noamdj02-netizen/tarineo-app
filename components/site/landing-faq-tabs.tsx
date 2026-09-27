"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Plus } from "lucide-react";
import { useMemo, useState } from "react";
import { EASE } from "@/components/motion/reveal";
import type { FaqGroup } from "@/lib/site/content";
import { cn } from "@/lib/utils";

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

export function LandingFaqTabs({ groups }: { groups: FaqGroup[] }) {
  const reduce = useReducedMotion();
  const [filter, setFilter] = useState("tous");
  const visible = useMemo(
    () => (filter === "tous" ? groups : groups.filter((g) => g.id === filter)),
    [filter, groups],
  );
  const firstKey = visible[0] ? `${visible[0].id}-0` : null;
  const [open, setOpen] = useState<string | null>(firstKey);

  let n = 0;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap gap-2" role="group" aria-label="Filtrer les questions">
        <Chip pressed={filter === "tous"} onClick={() => setFilter("tous")}>
          Toutes
        </Chip>
        {groups.map((g) => (
          <Chip
            key={g.id}
            pressed={filter === g.id}
            onClick={() => {
              setFilter(g.id);
              setOpen(`${g.id}-0`);
            }}
          >
            {g.label}
          </Chip>
        ))}
      </div>

      <div className="overflow-hidden rounded-[24px] border border-line bg-surface shadow-soft">
        {visible.map((group, gi) => (
          <div key={group.id} className={cn(gi > 0 && "border-t border-line")}>
            {filter === "tous" ? (
              <p className="mono-label px-5 pt-5 pb-1 sm:px-6">{`/ ${group.label} ///`}</p>
            ) : null}
            {group.items.map((it, i) => {
              const key = `${group.id}-${i}`;
              const isOpen = open === key;
              const index = n++;
              const id = panelId(it.q, index);
              return (
                <article key={key} className="border-b border-line last:border-b-0">
                  <h3 className="m-0 text-inherit">
                    <button
                      type="button"
                      aria-expanded={isOpen}
                      aria-controls={id}
                      onClick={() => setOpen(isOpen ? null : key)}
                      className="flex min-h-14 w-full items-center gap-3 px-5 py-3.5 text-left focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-2px] sm:min-h-16 sm:gap-4 sm:px-6"
                    >
                      <span className="w-7 shrink-0 font-mono text-[11px] tracking-[0.08em] text-muted-foreground">
                        {String(index + 1).padStart(2, "0")}
                      </span>
                      <span className="min-w-0 flex-1 text-[15px] font-medium leading-snug text-balance sm:text-[16px]">
                        {it.q}
                      </span>
                      <Plus
                        aria-hidden
                        className={cn(
                          "size-4 shrink-0 text-muted-foreground transition-transform duration-300 ease-out-soft",
                          isOpen && "rotate-45 text-foreground",
                        )}
                      />
                    </button>
                  </h3>
                  <AnimatePresence initial={false}>
                    {isOpen ? (
                      <motion.div
                        id={id}
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={reduce ? { duration: 0 } : { duration: 0.3, ease: EASE }}
                        className="overflow-hidden"
                      >
                        <p className="max-w-[62ch] px-5 pb-5 pl-12 text-[14.5px] leading-relaxed text-muted-foreground sm:px-6 sm:pl-[4.25rem]">
                          {it.a}
                        </p>
                      </motion.div>
                    ) : null}
                  </AnimatePresence>
                </article>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}

function Chip({
  pressed,
  onClick,
  children,
}: {
  pressed: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      aria-pressed={pressed}
      className={cn(
        "min-h-10 rounded-pill border px-4 text-[13px] font-medium transition-colors duration-200 ease-out-soft focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2",
        pressed
          ? "border-ink bg-ink text-accent-ink"
          : "border-line bg-surface text-foreground hover:bg-surface-2",
      )}
      onClick={onClick}
    >
      {children}
    </button>
  );
}
