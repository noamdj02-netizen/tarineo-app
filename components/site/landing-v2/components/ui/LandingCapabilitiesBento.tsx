"use client";

import Image from "next/image";
import {
  Building2,
  Check,
  ChevronDown,
  FileText,
  FolderOpen,
  HardHat,
  Mail,
  UserRound,
} from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";
import type { ElementType, ReactNode } from "react";

import { LANDING_CARD_SHADOW } from "@/components/site/landing-v2/components/ui/landing-surface-tokens";
import { LANDING_EASE, LANDING_VIEW } from "@/components/site/landing-v2/lib/landing-motion";
import { cn } from "@/lib/utils";

const ASSET = "/illustrations/landing-capabilities-196";

const DOSSIER_ROWS: {
  label: string;
  value: string;
  Icon: ElementType;
  accent: string;
}[] = [
  {
    label: "Artisan",
    value: "Vous",
    Icon: HardHat,
    accent: "bg-[#fff5ef] text-[#f7562c]",
  },
  {
    label: "Chantier",
    value: "Rénovation SDB · Lyon",
    Icon: Building2,
    accent: "bg-ink-900 text-white",
  },
  {
    label: "Client",
    value: "Dupont",
    Icon: UserRound,
    accent: "bg-paper-100 text-ink-700",
  },
];

const SUPPLIERS = [
  { name: "Cedeo", mark: "Ce", active: true },
  { name: "Point P", mark: "PP", active: false },
  { name: "Rexel", mark: "Rx", active: false },
] as const;

const DOC_TYPES = [
  { label: "Devis fournisseur", Icon: FileText },
  { label: "Devis client", Icon: FileText },
  { label: "Relance", Icon: Mail },
  { label: "Dossier", Icon: FolderOpen },
] as const;

const HUB_NODES = [
  { label: "Devis", angle: -90 },
  { label: "Relance", angle: 30 },
  { label: "Client", angle: 150 },
] as const;

function CapCard({
  title,
  description,
  children,
  className,
  delay = 0,
}: {
  title: string;
  description: ReactNode;
  children: ReactNode;
  className?: string;
  delay?: number;
}) {
  const reduce = useReducedMotion();

  return (
    <motion.article
      initial={reduce ? false : { opacity: 0, y: 16, scale: 0.98 }}
      whileInView={reduce ? undefined : { opacity: 1, y: 0, scale: 1 }}
      viewport={LANDING_VIEW}
      transition={{ duration: 0.45, delay, ease: LANDING_EASE }}
      whileHover={
        reduce
          ? undefined
          : { y: -4, transition: { duration: 0.28, ease: LANDING_EASE } }
      }
      className={cn(
        "relative flex flex-col overflow-hidden rounded-[22px] border border-black/[0.04] bg-[#f6f6f6]",
        className,
      )}
    >
      <div className="relative z-[1] flex flex-col gap-2 px-5 pt-5 pb-2 sm:gap-2.5 sm:px-6 sm:pt-6">
        <h3 className="text-balance text-[1.05rem] font-semibold tracking-tight text-ink-900 sm:text-[1.2rem]">
          {title}
        </h3>
        <p className="text-pretty text-[13px] font-medium leading-relaxed text-ink-500 sm:text-sm">
          {description}
        </p>
      </div>
      <div className="relative h-[152px] shrink-0 overflow-hidden sm:h-[164px]">{children}</div>
    </motion.article>
  );
}

function RolesVisual() {
  const reduce = useReducedMotion();

  return (
    <div className="absolute inset-0 flex items-end justify-center px-4 pb-3 sm:px-5 sm:pb-4">
      <div className="pointer-events-none absolute inset-0 opacity-25" aria-hidden>
        <Image
          src={`${ASSET}/curve-a.svg`}
          alt=""
          width={320}
          height={140}
          className="absolute bottom-[-10%] left-[-14%] w-[130%] max-w-none"
        />
      </div>
      <motion.div
        className={cn(
          "relative w-full max-w-[280px] overflow-hidden rounded-2xl border border-black/[0.06] bg-paper-0",
          LANDING_CARD_SHADOW,
        )}
        initial={reduce ? false : { opacity: 0, y: 14 }}
        whileInView={reduce ? undefined : { opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.45 }}
        transition={{ duration: 0.4, ease: LANDING_EASE }}
      >
        <div className="border-b border-black/[0.05] px-3 py-2.5">
          <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-ink-400">
            Dossier chantier
          </p>
          <p className="mt-0.5 truncate text-[13px] font-semibold leading-tight text-ink-900">
            Rénovation SDB — Dupont
          </p>
        </div>
        <ul className="flex flex-col gap-1 px-2 py-2">
          {DOSSIER_ROWS.map((row, i) => {
            const Icon = row.Icon;
            return (
              <motion.li
                key={row.label}
                className="flex items-center gap-2 rounded-xl px-1.5 py-1.5"
                initial={reduce ? false : { opacity: 0, x: -8 }}
                whileInView={reduce ? undefined : { opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.3, delay: 0.1 + i * 0.07, ease: LANDING_EASE }}
              >
                <span
                  className={cn(
                    "flex size-7 shrink-0 items-center justify-center rounded-lg",
                    row.accent,
                  )}
                >
                  <Icon className="size-3.5" strokeWidth={2.25} aria-hidden />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-[10px] font-medium leading-none text-ink-400">
                    {row.label}
                  </span>
                  <span className="mt-0.5 block truncate text-[12px] font-semibold leading-tight text-ink-800">
                    {row.value}
                  </span>
                </span>
              </motion.li>
            );
          })}
        </ul>
      </motion.div>
    </div>
  );
}

function RelanceVisual() {
  const reduce = useReducedMotion();

  return (
    <div className="absolute inset-x-0 bottom-5 flex justify-center sm:bottom-6">
      <motion.div
        className="relative"
        initial={reduce ? false : { opacity: 0, y: 16, scale: 0.94 }}
        whileInView={reduce ? undefined : { opacity: 1, y: 0, scale: 1 }}
        viewport={{ once: true, amount: 0.5 }}
        transition={{ duration: 0.4, ease: LANDING_EASE }}
      >
        <motion.div
          className="absolute -inset-x-6 -inset-y-4 rounded-[28px] bg-[#ffd8cc]/70 blur-[1px]"
          aria-hidden
          animate={reduce ? undefined : { opacity: [0.45, 0.85, 0.45], scale: [0.96, 1.04, 0.96] }}
          transition={
            reduce ? undefined : { duration: 2.6, repeat: Infinity, ease: "easeInOut" }
          }
        />
        <motion.div
          className="relative rounded-2xl bg-[#ffb89e] px-5 py-3 text-[14px] font-semibold tracking-tight text-[#7a2208] shadow-[inset_0_-3px_5px_rgba(0,0,0,0.08),inset_0_5px_5px_rgba(255,255,255,0.4),0_8px_18px_rgba(247,86,44,0.2)] sm:px-6 sm:text-[15px]"
          animate={reduce ? undefined : { y: [0, -3, 0] }}
          transition={
            reduce ? undefined : { duration: 2.4, repeat: Infinity, ease: "easeInOut" }
          }
        >
          Préparer la relance
        </motion.div>
        <motion.div
          className="pointer-events-none absolute -right-1 -bottom-4 size-8 sm:size-9"
          animate={
            reduce
              ? undefined
              : {
                  x: [0, -6, 0],
                  y: [0, -8, 0],
                  rotate: [-12, -18, -12],
                  scale: [1, 0.92, 1],
                }
          }
          transition={
            reduce
              ? undefined
              : { duration: 1.8, repeat: Infinity, ease: "easeInOut", repeatDelay: 0.6 }
          }
        >
          <Image
            src={`${ASSET}/hand.svg`}
            alt=""
            width={36}
            height={36}
            className="size-full"
          />
        </motion.div>
      </motion.div>
    </div>
  );
}

function SuppliersVisual() {
  const reduce = useReducedMotion();
  const others = SUPPLIERS.filter((s) => !s.active);

  return (
    <div className="absolute inset-x-4 bottom-3 flex justify-center sm:inset-x-6 sm:bottom-4">
      <motion.div
        className={cn(
          "w-full max-w-[260px] overflow-hidden rounded-2xl border border-black/[0.06] bg-paper-0",
          LANDING_CARD_SHADOW,
        )}
        initial={reduce ? false : { opacity: 0, y: 14 }}
        whileInView={reduce ? undefined : { opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.45 }}
        transition={{ duration: 0.4, ease: LANDING_EASE }}
      >
        <div className="flex items-center gap-2.5 border-b border-black/[0.05] px-3 py-2.5">
          <motion.span
            className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-[#fff5ef] text-[10px] font-bold text-[#f7562c]"
            animate={reduce ? undefined : { scale: [1, 1.06, 1] }}
            transition={
              reduce ? undefined : { duration: 2.2, repeat: Infinity, ease: "easeInOut" }
            }
          >
            Ce
          </motion.span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-[13px] font-semibold leading-none text-ink-900">Cedeo</p>
            <p className="mt-0.5 truncate text-[10px] font-medium text-ink-400">
              Fournisseur actif
            </p>
          </div>
          <motion.span
            animate={reduce ? undefined : { rotate: [0, 180, 180, 0] }}
            transition={
              reduce
                ? undefined
                : { duration: 2.4, times: [0, 0.15, 0.75, 1], repeat: Infinity, ease: LANDING_EASE }
            }
          >
            <ChevronDown className="size-3.5 shrink-0 text-ink-400" aria-hidden />
          </motion.span>
        </div>
        <ul className="px-1.5 py-1.5" aria-hidden>
          {others.map((item, i) => (
            <motion.li
              key={item.name}
              className="flex items-center gap-2 rounded-lg px-2 py-1.5 text-[12px] font-semibold text-ink-600"
              initial={reduce ? false : { opacity: 0, x: -8 }}
              whileInView={reduce ? undefined : { opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.3, delay: 0.15 + i * 0.08, ease: LANDING_EASE }}
            >
              <span className="flex size-6 shrink-0 items-center justify-center rounded-md bg-paper-100 text-[9px] font-bold text-ink-500">
                {item.mark}
              </span>
              {item.name}
            </motion.li>
          ))}
        </ul>
      </motion.div>
    </div>
  );
}

function DocsVisual() {
  const reduce = useReducedMotion();

  return (
    <div className="absolute inset-x-4 bottom-3 grid grid-cols-2 gap-2 sm:inset-x-5 sm:bottom-4">
      {DOC_TYPES.map(({ label, Icon }, i) => (
        <motion.div
          key={label}
          className={cn(
            "flex min-h-11 items-center gap-2 rounded-[12px] border border-black/[0.05] bg-paper-0 px-2.5 py-2",
            LANDING_CARD_SHADOW,
          )}
          initial={reduce ? false : { opacity: 0, y: 12, scale: 0.96 }}
          whileInView={reduce ? undefined : { opacity: 1, y: 0, scale: 1 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.35, delay: 0.06 * i, ease: LANDING_EASE }}
          whileHover={
            reduce
              ? undefined
              : { y: -2, transition: { duration: 0.2, ease: LANDING_EASE } }
          }
        >
          <span className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-[#fff5ef] text-[#f7562c]">
            <Icon className="size-3.5" strokeWidth={2.25} aria-hidden />
          </span>
          <span className="truncate text-[11px] font-semibold leading-tight text-ink-800">
            {label}
          </span>
        </motion.div>
      ))}
    </div>
  );
}

function HubVisual() {
  const reduce = useReducedMotion();
  const r = 44;

  return (
    <div className="absolute inset-0 flex items-center justify-center">
      <div className="relative size-[124px] sm:size-[132px]">
        <svg
          className="pointer-events-none absolute inset-0 size-full text-[#e8e0dc]"
          viewBox="0 0 132 132"
          aria-hidden
        >
          {HUB_NODES.map((node, i) => {
            const rad = (node.angle * Math.PI) / 180;
            const x = 66 + Math.cos(rad) * r;
            const y = 66 + Math.sin(rad) * r;
            return (
              <motion.line
                key={node.label}
                x1="66"
                y1="66"
                x2={x}
                y2={y}
                stroke="currentColor"
                strokeWidth="1.5"
                initial={reduce ? false : { pathLength: 0, opacity: 0 }}
                whileInView={reduce ? undefined : { pathLength: 1, opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.1 + i * 0.1, ease: LANDING_EASE }}
              />
            );
          })}
        </svg>

        {HUB_NODES.map((node, i) => {
          const rad = (node.angle * Math.PI) / 180;
          const x = 50 + Math.cos(rad) * 33.5;
          const y = 50 + Math.sin(rad) * 33.5;
          return (
            <motion.span
              key={node.label}
              className={cn(
                "absolute flex h-8 -translate-x-1/2 -translate-y-1/2 items-center rounded-full border border-black/[0.06] bg-paper-0 px-2.5 text-[10px] font-semibold text-ink-700",
                LANDING_CARD_SHADOW,
              )}
              style={{ left: `${x}%`, top: `${y}%` }}
              initial={reduce ? false : { opacity: 0, scale: 0.7 }}
              whileInView={reduce ? undefined : { opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.35, delay: 0.28 + i * 0.1, ease: LANDING_EASE }}
            >
              {node.label}
            </motion.span>
          );
        })}

        <motion.span
          className="absolute left-1/2 top-1/2 flex size-12 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-[#f7562c] text-white shadow-[0_8px_20px_rgba(247,86,44,0.38)]"
          initial={reduce ? false : { opacity: 0, scale: 0.55 }}
          whileInView={reduce ? undefined : { opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.45, delay: 0.45, ease: LANDING_EASE }}
        >
          <motion.span
            className="absolute inset-0 rounded-full bg-[#f7562c]"
            aria-hidden
            animate={
              reduce
                ? undefined
                : { scale: [1, 1.35, 1], opacity: [0.45, 0, 0.45] }
            }
            transition={
              reduce
                ? undefined
                : { duration: 2.2, delay: 0.9, repeat: Infinity, ease: "easeOut" }
            }
          />
          <Check className="relative z-[1] size-5" strokeWidth={2.75} aria-hidden />
          <span className="sr-only">Validé</span>
        </motion.span>
      </div>
    </div>
  );
}

/** Figma Features 196:1481 — bento capabilities adapté Tarineo. */
export function LandingCapabilitiesBento({ className }: { className?: string }) {
  return (
    <div
      data-node-id="196:1481"
      className={cn("grid w-full gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-6", className)}
    >
      <CapCard
        className="lg:col-span-2"
        delay={0}
        title="Un dossier par chantier"
        description={
          <>
            Artisan, chantier et client liés dans{" "}
            <span className="font-semibold text-ink-800">le même dossier</span>
            {" — "}plus besoin de chercher dans trois endroits.
          </>
        }
      >
        <RolesVisual />
      </CapCard>

      <CapCard
        className="lg:col-span-2"
        delay={0.05}
        title="Relances au bon moment"
        description={
          <>
            Préparez une relance{" "}
            <span className="font-semibold text-ink-800">quand la hausse est claire</span>
            {", "}pas quand le calendrier le permet.
          </>
        }
      >
        <RelanceVisual />
      </CapCard>

      <CapCard
        className="sm:col-span-2 lg:col-span-2"
        delay={0.1}
        title="Fournisseurs suivis"
        description={
          <>
            <span className="font-semibold text-ink-800">Un hub pour vos enseignes</span> — devis,
            hausses et relances, sans tableur.
          </>
        }
      >
        <SuppliersVisual />
      </CapCard>

      <CapCard
        className="lg:col-span-3"
        delay={0.08}
        title="Pièces rattachées"
        description={
          <>
            <span className="font-semibold text-ink-800">Devis, relances et photos</span> dans le
            même dossier — prêts à ouvrir.
          </>
        }
      >
        <DocsVisual />
      </CapCard>

      <CapCard
        className="lg:col-span-3"
        delay={0.12}
        title="Vous validez avant l’envoi"
        description={
          <>
            Relance ou devis client :{" "}
            <span className="font-semibold text-ink-800">rien ne part sans votre feu vert.</span>
          </>
        }
      >
        <HubVisual />
      </CapCard>
    </div>
  );
}
