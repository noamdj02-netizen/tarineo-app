"use client";

import Image from "next/image";
import { motion, useReducedMotion } from "framer-motion";
import { Bell, FileText, MoreHorizontal, Percent } from "lucide-react";
import { useEffect, useState, type ElementType } from "react";

import { Badge } from "@/components/site/landing-v2/components/ui/Badge";
import { LANDING_CARD_SHADOW } from "@/components/site/landing-v2/components/ui/landing-surface-tokens";
import { LANDING_EASE } from "@/components/site/landing-v2/lib/landing-motion";
import { cn } from "@/lib/utils";

const CARD_SHADOW_LIFTED =
  "shadow-[0_4px_8px_rgba(97,44,0,0.06),0_16px_28px_rgba(97,44,0,0.08),0_40px_56px_rgba(156,156,156,0.14)]";

export type LandingChantierStatus = "focus" | "pause" | "fini";

export type LandingChantierCardData = {
  title: string;
  client: string;
  address: string;
  status: LandingChantierStatus;
  lastUpdated: string;
  description: string;
  tags: string[];
  docsCount: number;
  people: { initials: string }[];
  /** Photo terrain en couverture. */
  coverImage: string;
};

const STATUS_LABEL: Record<LandingChantierStatus, string> = {
  focus: "En cours",
  pause: "En pause",
  fini: "Terminé",
};

const STATUS_DOT: Record<LandingChantierStatus, string> = {
  focus: "bg-success",
  pause: "bg-warning",
  fini: "bg-ink-300",
};

const ACTIONS: { Icon: ElementType; className: string }[] = [
  { Icon: FileText, className: "bg-ink-900" },
  { Icon: Bell, className: "bg-accent" },
  { Icon: Percent, className: "bg-ink-700" },
];

/** Carte chantier landing — photo terrain + fiche. */
export function LandingChantierCard({
  data,
  className,
}: {
  data: LandingChantierCardData;
  className?: string;
}) {
  const reduce = useReducedMotion();
  const [canHover, setCanHover] = useState(false);
  const [hovered, setHovered] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(hover: hover) and (pointer: fine)");
    const sync = () => setCanHover(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  const lift = canHover && !reduce && hovered;

  return (
    <motion.article
      onHoverStart={canHover && !reduce ? () => setHovered(true) : undefined}
      onHoverEnd={canHover && !reduce ? () => setHovered(false) : undefined}
      animate={lift ? { y: -5 } : { y: 0 }}
      transition={{ duration: 0.28, ease: LANDING_EASE }}
      className={cn("w-full cursor-default", className)}
      aria-label={`Chantier exemple ${data.title}`}
    >
      <div
        className={cn(
          "h-full overflow-hidden rounded-[22px] border border-black/[0.04] bg-paper-0 transition-[box-shadow,border-color] duration-300",
          lift ? CARD_SHADOW_LIFTED : LANDING_CARD_SHADOW,
          lift && "border-black/[0.06]",
        )}
      >
        <div className="relative h-40 w-full overflow-hidden bg-ink-200 sm:h-[11.5rem]">
          <Image
            src={data.coverImage}
            alt=""
            fill
            className="object-cover object-center"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 360px"
          />
          <div
            className="absolute inset-0 bg-gradient-to-t from-black/25 via-transparent to-transparent"
            aria-hidden
          />
          <span className="absolute top-3 right-3 z-10 inline-flex items-center gap-1.5 rounded-full border border-white/40 bg-paper-0/95 px-2 py-1 text-[10px] font-semibold text-ink-700 shadow-sm">
            <span className={cn("size-1.5 rounded-full", STATUS_DOT[data.status])} aria-hidden />
            {STATUS_LABEL[data.status]}
          </span>
        </div>

        <div className="p-4">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <p className="text-xs font-medium text-ink-400">{data.lastUpdated}</p>
              <h3 className="mt-1 text-base font-semibold tracking-tight text-ink-900 sm:text-lg">
                {data.title}
              </h3>
              <p className="mt-0.5 truncate text-xs font-medium text-ink-500">
                {data.client} · {data.address}
              </p>
            </div>
            <span className="text-ink-300" aria-hidden>
              <MoreHorizontal size={18} />
            </span>
          </div>

          <p className="mt-3 text-sm leading-relaxed text-ink-500">{data.description}</p>
          <div className="mt-3 flex flex-wrap gap-1.5">
            {data.tags.map((tag) => (
              <Badge key={tag} tone="muted" size="sm">
                {tag}
              </Badge>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-between border-t border-black/[0.05] px-4 py-3">
          <div className="flex -space-x-2" aria-hidden>
            {data.people.map((person) => (
              <span
                key={person.initials}
                className="flex size-7 items-center justify-center rounded-full border-2 border-paper-0 bg-paper-100 text-[10px] font-semibold text-ink-600"
              >
                {person.initials}
              </span>
            ))}
          </div>
          <div className="flex -space-x-2" aria-hidden>
            {ACTIONS.map(({ Icon, className: bg }, i) => (
              <span
                key={i}
                className={cn(
                  "flex size-7 items-center justify-center rounded-full border-2 border-paper-0 text-white",
                  bg,
                )}
              >
                <Icon size={13} strokeWidth={2.25} />
              </span>
            ))}
          </div>
        </div>
      </div>
    </motion.article>
  );
}
