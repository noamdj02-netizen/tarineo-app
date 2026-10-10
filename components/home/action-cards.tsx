"use client";

import { motion, useReducedMotion } from "framer-motion";
import { ArrowUpRight, ClipboardCheck, Palette, Rocket } from "lucide-react";
import Link from "next/link";
import { Reveal } from "@/components/motion/reveal";

// Les icônes sont choisies ici (côté client) : une page serveur ne peut pas passer un composant.
const ICONS = { rocket: Rocket, check: ClipboardCheck, palette: Palette };

export type ActionCard = {
  n: string;
  label: string;
  title: string;
  text: string;
  href: string;
  icon: keyof typeof ICONS;
};

/** 3 cartes d'action qui se soulèvent au survol. */
export function ActionCards({
  cards,
  layout = "cards",
  stripCols = 3,
}: {
  cards: ActionCard[];
  layout?: "cards" | "strip";
  /** Nombre de colonnes en mode bandeau (1 = pile verticale, idéal colonne étroite). */
  stripCols?: 1 | 2 | 3;
}) {
  const reduce = useReducedMotion();
  if (layout === "strip") {
    return (
      <div
        className={
          stripCols === 1
            ? "grid grid-cols-1 gap-2"
            : stripCols === 2
              ? "grid grid-cols-1 gap-2 sm:grid-cols-2"
              : "grid grid-cols-1 gap-2 sm:grid-cols-3"
        }
      >
        {cards.map(({ n, label, title, href, icon }) => {
          const Icon = ICONS[icon];
          return (
            <Link
              key={href + n}
              href={href}
              className="card-soft pressable group flex min-h-[4.25rem] items-center gap-3 px-3.5 py-2.5 hover:shadow-lift"
            >
              <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-accent-soft text-ink">
                <Icon className="size-4" aria-hidden />
              </span>
              <span className="min-w-0 flex-1">
                <span className="mono-label block text-[10px]">/ {label}</span>
                <span className="block truncate text-[14px] font-semibold tracking-[-0.02em]">
                  {title}
                </span>
              </span>
              <ArrowUpRight
                className="size-3.5 shrink-0 text-muted-foreground transition-transform duration-150 ease-out group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                strokeWidth={2}
                aria-hidden
              />
            </Link>
          );
        })}
      </div>
    );
  }
  return (
    <div className="grid gap-3 sm:grid-cols-3">
      {cards.map(({ n, label, title, text, href, icon }) => {
        const Icon = ICONS[icon];
        return (
          <Reveal key={href + n}>
            <motion.div
              whileHover={reduce ? undefined : { y: -3 }}
              whileTap={reduce ? undefined : { scale: 0.96 }}
              transition={{ duration: 0.15, ease: "easeOut" }}
              className="h-full"
            >
              <Link
                href={href}
                className="card-soft group flex h-full flex-col gap-4 p-5 hover:shadow-lift"
              >
                <div className="flex items-center justify-between">
                  <span className="grid size-10 place-items-center rounded-xl bg-accent-soft text-ink">
                    <Icon className="size-[18px]" aria-hidden />
                  </span>
                  <span className="font-mono text-[11px] text-muted-foreground">
                    {n} /
                  </span>
                </div>
                <div className="flex flex-1 flex-col gap-1.5">
                  <p className="mono-label">/ {label}</p>
                  <h3 className="text-[17px] leading-snug font-semibold tracking-[-0.02em]">
                    {title}
                  </h3>
                  <p className="text-[14px] leading-relaxed text-muted-foreground">
                    {text}
                  </p>
                </div>
                <span className="flex items-center gap-1.5 font-mono text-[11px] font-medium tracking-[0.1em] text-ink uppercase">
                  Ouvrir
                  <ArrowUpRight
                    className="size-3.5 transition-transform duration-300 ease-out-soft group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                    aria-hidden
                  />
                </span>
              </Link>
            </motion.div>
          </Reveal>
        );
      })}
    </div>
  );
}
