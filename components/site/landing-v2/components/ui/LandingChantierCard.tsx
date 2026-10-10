"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Bell, FileText, MoreHorizontal, Percent } from "lucide-react";
import { useState, type ElementType } from "react";

import { Badge } from "@/components/site/landing-v2/components/ui/Badge";
import { DEMO_MARK } from "@/lib/site/tarineo";
import { cn } from "@/lib/utils";

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
  /** Métrique affichée dans le bandeau mesh. */
  coverMetric: string;
  coverLabel: string;
  /** Lignes fictives dans l’aperçu doc. */
  coverLines: string[];
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

const detailVariants = {
  hidden: { opacity: 0, height: 0, marginTop: 0 },
  visible: {
    opacity: 1,
    height: "auto" as const,
    marginTop: "0.75rem",
    transition: { duration: 0.28, ease: "easeInOut" as const },
  },
};

function CoverPreview({
  metric,
  label,
  lines,
  reduce,
}: {
  metric: string;
  label: string;
  lines: string[];
  reduce: boolean | null;
}) {
  return (
    <div className="absolute inset-x-3 bottom-3 top-10 flex items-end gap-2.5 sm:inset-x-4 sm:bottom-3.5 sm:top-11">
      {/* Pile de docs */}
      <div className="relative h-[4.75rem] w-[42%] shrink-0 sm:h-[5.25rem]">
        <div
          className="absolute inset-x-1 bottom-0 h-[88%] rotate-[-6deg] rounded-lg border border-white/70 bg-white/55 shadow-sm backdrop-blur-[2px]"
          aria-hidden
        />
        <div
          className="absolute inset-x-0.5 bottom-0 h-[92%] rotate-[3deg] rounded-lg border border-white/80 bg-white/70 shadow-sm"
          aria-hidden
        />
        <motion.div
          className="absolute inset-0 flex flex-col gap-1.5 rounded-lg border border-white/90 bg-paper-0/95 p-2 shadow-card"
          initial={reduce ? false : { y: 8, opacity: 0.85 }}
          whileHover={reduce ? undefined : { y: -2 }}
          transition={{ duration: 0.25, ease: "easeOut" }}
        >
          <div className="flex items-center gap-1.5">
            <span className="size-1.5 rounded-full bg-accent" aria-hidden />
            <span className="h-1.5 flex-1 rounded-full bg-paper-200" aria-hidden />
          </div>
          {lines.slice(0, 3).map((line) => (
            <div key={line} className="flex items-center gap-1.5">
              <span className="h-1 w-[28%] rounded-full bg-paper-200" aria-hidden />
              <span className="truncate text-[9px] font-medium leading-none text-ink-500">
                {line}
              </span>
            </div>
          ))}
        </motion.div>
      </div>

      {/* Métrique */}
      <div className="mb-0.5 min-w-0 flex-1 rounded-xl border border-white/70 bg-white/80 px-2.5 py-2 shadow-sm backdrop-blur-sm">
        <p className="text-[10px] font-medium tracking-wide text-ink-400 uppercase">
          {label}
        </p>
        <p className="mt-0.5 font-mono text-lg font-semibold tracking-tight text-ink-900 nums sm:text-xl">
          {metric}
        </p>
      </div>
    </div>
  );
}

/** Carte chantier landing — look dashboard + hover WorkflowBuilder. */
export function LandingChantierCard({
  data,
  className,
}: {
  data: LandingChantierCardData;
  className?: string;
}) {
  const reduce = useReducedMotion();
  const [hovered, setHovered] = useState(false);
  const open = reduce ? true : hovered;

  return (
    <motion.article
      onHoverStart={reduce ? undefined : () => setHovered(true)}
      onHoverEnd={reduce ? undefined : () => setHovered(false)}
      whileHover={reduce ? undefined : { y: -6 }}
      transition={{ duration: 0.3, ease: [0.25, 1, 0.5, 1] }}
      className={cn("w-full cursor-default", className)}
      aria-label={`Chantier exemple ${data.title}`}
    >
      <div className="overflow-hidden rounded-xl border border-line bg-paper-0 shadow-card transition-shadow duration-300 hover:shadow-float">
        <div className="relative h-36 w-full overflow-hidden bg-[#fff5ef] sm:h-40">
          <div
            className="absolute -top-[40%] -left-[30%] h-[180%] w-[180%] blur-[20px]"
            style={{
              background:
                "radial-gradient(circle, #ffc9a8 0%, #ff8a4a 48%, #ff6b1a 82%, transparent 100%)",
            }}
            aria-hidden
          />
          <div
            className="absolute top-[8%] left-[18%] h-[72%] w-[72%] opacity-90 blur-[14px]"
            style={{
              background:
                "radial-gradient(circle, #fff 0%, #fff8f3 45%, #ffd4b8 78%, transparent 95%)",
            }}
            aria-hidden
          />
          <div
            className="absolute inset-0 bg-gradient-to-t from-[#fff5ef]/90 via-transparent to-white/10"
            aria-hidden
          />

          <Badge tone="accent" size="sm" className="absolute top-3 left-3 z-10 shadow-sm">
            {DEMO_MARK}
          </Badge>
          <span className="absolute top-3 right-3 z-10 inline-flex items-center gap-1.5 rounded-full border border-white/60 bg-white/85 px-2 py-1 text-[10px] font-semibold text-ink-700 backdrop-blur-sm">
            <span className={cn("size-1.5 rounded-full", STATUS_DOT[data.status])} aria-hidden />
            {STATUS_LABEL[data.status]}
          </span>

          <CoverPreview
            metric={data.coverMetric}
            label={data.coverLabel}
            lines={data.coverLines}
            reduce={reduce}
          />
        </div>

        <div className="p-4">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <p className="text-xs text-ink-400">{data.lastUpdated}</p>
              <h3 className="mt-1 text-base font-semibold tracking-tight text-ink-900 sm:text-lg">
                {data.title}
              </h3>
              <p className="mt-0.5 truncate text-xs text-ink-500">
                {data.client} · {data.address}
              </p>
            </div>
            <span className="text-ink-300" aria-hidden>
              <MoreHorizontal size={18} />
            </span>
          </div>

          <AnimatePresence initial={false}>
            {open ? (
              <motion.div
                key="details"
                initial={reduce ? false : "hidden"}
                animate="visible"
                exit="hidden"
                variants={detailVariants}
                className="overflow-hidden"
              >
                <p className="text-sm leading-relaxed text-ink-500">{data.description}</p>
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {data.tags.map((tag) => (
                    <Badge key={tag} tone="muted" size="sm">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </motion.div>
            ) : null}
          </AnimatePresence>
        </div>

        <div className="flex items-center justify-between border-t border-line px-4 py-3">
          <div className="flex -space-x-2">
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
