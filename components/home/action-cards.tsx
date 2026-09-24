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
export function ActionCards({ cards }: { cards: ActionCard[] }) {
  const reduce = useReducedMotion();
  return (
    <div className="grid gap-3 sm:grid-cols-3">
      {cards.map(({ n, label, title, text, href, icon }) => {
        const Icon = ICONS[icon];
        return (
          <Reveal key={href + n}>
            <motion.div
              whileHover={reduce ? undefined : { y: -4 }}
              transition={{ duration: 0.35, ease: [0.2, 0.8, 0.2, 1] }}
              className="h-full"
            >
              <Link
                href={href}
                className="card-soft group flex h-full flex-col gap-4 p-5 transition-shadow duration-300 ease-out-soft hover:shadow-lift"
              >
                <div className="flex items-center justify-between">
                  <span className="grid size-10 place-items-center rounded-xl bg-accent-soft text-ink">
                    <Icon className="size-[18px]" aria-hidden />
                  </span>
                  <span className="font-mono text-[11px] text-muted">
                    {n} /
                  </span>
                </div>
                <div className="flex flex-1 flex-col gap-1.5">
                  <p className="mono-label">/ {label}</p>
                  <h3 className="text-[17px] leading-snug font-semibold tracking-[-0.02em]">
                    {title}
                  </h3>
                  <p className="text-[14px] leading-relaxed text-muted">
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
