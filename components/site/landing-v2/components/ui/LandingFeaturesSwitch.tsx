"use client";

import Link from "next/link";
import { ArrowUpRight, ChevronRight, FileText, Send } from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useState } from "react";

import { TarineoCopilotAvatar } from "@/components/assistant/copilot-face";
import { LandingHeroOrangeBackdrop } from "@/components/site/landing-v2/components/ui/LandingHeroOrangeBackdrop";
import {
  LANDING_CARD_SHADOW,
  LANDING_CARD_SHADOW_HOVER,
  LandingSectionHeading,
} from "@/components/site/landing-v2/components/ui/LandingSurface";
import { TactileButton } from "@/components/site/landing-v2/components/ui/TactileButton";
import { LANDING_EASE } from "@/components/site/landing-v2/lib/landing-motion";
import { LANDING_SIGNUP } from "@/lib/site/landing-v2-auth";
import { DEMO_MARK } from "@/lib/site/tarineo";
import { cn } from "@/lib/utils";

const TABS = [
  { id: "copilote", label: "Copilote" },
  { id: "chantiers", label: "Chantiers" },
  { id: "alertes", label: "Alertes" },
] as const;

type TabId = (typeof TABS)[number]["id"];

const COPILOTE_LINES = [
  { label: "Chauffe-eau 200 L", delta: "+12 %", amount: "+92 €" },
  { label: "Tube PER Ø16", delta: "+7 %", amount: "+18 €" },
] as const;

const EXTRACTED_LINES = [
  { label: "Chauffe-eau 200 L", qty: "1", pu: "768 €", flag: true },
  { label: "Tube PER Ø16", qty: "42 m", pu: "2,85 €", flag: true },
  { label: "Colliers Ø16", qty: "24", pu: "0,42 €", flag: false },
] as const;

const PRIMARY_BY_TAB: Record<
  TabId,
  {
    title: string;
    text: string;
    primaryLabel: string;
    secondaryLabel: string;
    secondaryHref: string;
  }
> = {
  copilote: {
    title: "Réponses nettes sur vos devis",
    text: "Posez une question sur une pièce fournisseur : Tarineo résume les hausses, les lignes à risque et ce qu’il faut valider avant envoi client.",
    primaryLabel: "Essayer gratuitement",
    secondaryLabel: "Voir le produit",
    secondaryHref: "/#produit",
  },
  chantiers: {
    title: "Un dossier par chantier",
    text: "Devis fournisseurs, devis client et relances rattachés au bon dossier — sans tableur ni pièces éparpillées dans la boîte mail.",
    primaryLabel: "Créer mon compte",
    secondaryLabel: "Voir les chantiers",
    secondaryHref: "/#produit",
  },
  alertes: {
    title: "Hausses détectées avant la marge",
    text: "Dès qu’une référence sort de vos habitudes d’achat, une alerte claire apparaît — vous validez, puis vous renégociez ou vous ajustez le devis client.",
    primaryLabel: "Analyser un devis",
    secondaryLabel: "Voir les relances",
    secondaryHref: "/#relances",
  },
};

/** Figma Features Section (193:511) — adapté Tarineo (orange, copy métier). */
export function LandingFeaturesSwitch({ className }: { className?: string }) {
  const [tab, setTab] = useState<TabId>("copilote");
  const reduce = useReducedMotion();
  const primary = PRIMARY_BY_TAB[tab];

  return (
    <div data-node-id="193:511" className={cn("flex w-full flex-col gap-10 sm:gap-12", className)}>
      <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between lg:gap-10">
        <LandingSectionHeading
          align="left"
          badge="Fonctionnalités"
          title={
            <>
              Travaillez plus vite
              <br />
              sur ce qui protège la marge.
            </>
          }
          className="max-w-xl"
        />

        <div
          role="tablist"
          aria-label="Fonctionnalités Tarineo"
          className="inline-flex w-fit max-w-full items-center gap-0.5 overflow-x-auto rounded-full border border-black/[0.04] bg-[#ededed] p-1"
        >
          {TABS.map((item, i) => {
            const active = tab === item.id;
            return (
              <div key={item.id} className="flex items-center">
                {i === 2 ? (
                  <span className="mx-0.5 h-5 w-px shrink-0 bg-black/10" aria-hidden />
                ) : null}
                <button
                  type="button"
                  role="tab"
                  id={`features-tab-${item.id}`}
                  aria-controls={`features-panel-${item.id}`}
                  aria-selected={active}
                  onClick={() => setTab(item.id)}
                  className={cn(
                    "relative min-h-11 rounded-full px-4 py-2.5 text-[15px] font-medium tracking-tight transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-tarineo-orange/45 sm:px-5",
                    active ? "text-ink-900" : "text-ink-500 hover:text-ink-700",
                  )}
                >
                  {active ? (
                    <motion.span
                      layoutId={reduce ? undefined : "features-tab-pill"}
                      className="absolute inset-0 rounded-full bg-paper-0 shadow-[0_8px_8px_rgba(0,0,0,0.02),0_3px_3px_rgba(0,0,0,0.05),0_1px_1px_rgba(0,0,0,0.12)]"
                      transition={{ type: "spring", stiffness: 420, damping: 34 }}
                    />
                  ) : null}
                  <span className="relative z-[1] whitespace-nowrap">{item.label}</span>
                </button>
              </div>
            );
          })}
        </div>
      </div>

      <div className="mt-10 flex flex-col gap-6 sm:mt-12 sm:gap-7">
        <motion.article
          key={tab}
          initial={reduce ? false : { opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: LANDING_EASE }}
          className={cn(
            "grid overflow-hidden rounded-[30px] border border-black/[0.04] bg-paper-0 lg:grid-cols-2",
            LANDING_CARD_SHADOW,
          )}
        >
          <div className="flex flex-col justify-between gap-10 p-7 sm:p-10 lg:p-12">
            <div className="flex flex-col gap-3">
              <h3 className="text-balance text-[clamp(1.6rem,3vw,2.4rem)] font-semibold leading-[1.15] tracking-[-0.03em] text-ink-900">
                {primary.title}
              </h3>
              <p className="max-w-[36rem] text-pretty text-[16px] font-medium leading-[1.5] text-ink-500 sm:text-lg">
                {primary.text}
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-4">
              <TactileButton href={LANDING_SIGNUP} size="default" indicatorColor="accent">
                {primary.primaryLabel}
              </TactileButton>
              <Link
                href={primary.secondaryHref}
                className="inline-flex min-h-11 items-center gap-0.5 text-[15px] font-medium text-ink-600 transition-colors hover:text-ink-900"
              >
                {primary.secondaryLabel}
                <ChevronRight className="size-[18px]" strokeWidth={2} aria-hidden />
              </Link>
            </div>
          </div>

          <div
            className="relative min-h-[280px] overflow-hidden rounded-[30px] border-8 border-white bg-gradient-to-b from-[#faad98] to-[#f7562c] to-[66.507%] sm:min-h-[360px] lg:min-h-[420px]"
          >
            <LandingHeroOrangeBackdrop />
            <AnimatePresence mode="wait">
              <motion.div
                key={tab}
                initial={reduce ? false : { opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={reduce ? undefined : { opacity: 0, scale: 0.98 }}
                transition={{ duration: 0.3, ease: LANDING_EASE }}
                className="relative z-[1] flex h-full items-center justify-center p-5 sm:p-7"
              >
                {tab === "copilote" ? <CopiloteVisual /> : null}
                {tab === "chantiers" ? <ChantierVisual /> : null}
                {tab === "alertes" ? <AlerteVisual /> : null}
              </motion.div>
            </AnimatePresence>
          </div>
        </motion.article>

        <article
          className={cn(
            "grid overflow-hidden rounded-[30px] border border-black/[0.04] bg-paper-0 transition-[box-shadow,border-color] duration-300 lg:grid-cols-2",
            LANDING_CARD_SHADOW,
            "hover:border-black/[0.06]",
            LANDING_CARD_SHADOW_HOVER,
          )}
        >
          <div
            className="relative order-2 min-h-[280px] overflow-hidden rounded-[30px] border-8 border-white bg-gradient-to-b from-[#faad98] to-[#f7562c] to-[66.507%] sm:min-h-[360px] lg:order-1 lg:min-h-[420px]"
          >
            <LandingHeroOrangeBackdrop />
            <div className="relative z-[1] flex h-full items-center justify-center p-5 sm:p-8">
              <DocsGridVisual />
            </div>
          </div>

          <div className="order-1 flex flex-col justify-between gap-10 p-7 sm:p-10 lg:order-2 lg:p-12">
            <div className="flex flex-col gap-3">
              <h3 className="text-balance text-[clamp(1.6rem,3vw,2.4rem)] font-semibold leading-[1.15] tracking-[-0.03em] text-ink-900">
                PDF fournisseurs, lus au même endroit
              </h3>
              <p className="max-w-[36rem] text-pretty text-[16px] font-medium leading-[1.5] text-ink-500 sm:text-lg">
                Importez un devis ou une facture : Tarineo structure les lignes, quantités et PU
                pour comparer à votre historique — sans ressaisie dans un tableur.
              </p>
            </div>
            <div>
              <TactileButton href={LANDING_SIGNUP} size="default" indicatorColor="accent">
                Importer un devis
              </TactileButton>
              <p className="mt-3 text-xs font-medium text-ink-400">
                PDF ou photo — vous validez toujours avant envoi.
              </p>
            </div>
          </div>
        </article>
      </div>
    </div>
  );
}

function DemoChip({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "rounded-full bg-paper-50 px-2 py-0.5 text-[10px] font-semibold tracking-wide text-ink-400 ring-1 ring-black/[0.04]",
        className,
      )}
    >
      {DEMO_MARK}
    </span>
  );
}

function CopiloteVisual() {
  const reduce = useReducedMotion();

  return (
    <div className="relative w-full max-w-[360px]">
      <div className="overflow-hidden rounded-[24px] border border-black/[0.04] bg-paper-0 shadow-[0_16px_40px_rgba(97,44,0,0.12)]">
        <div className="flex items-center justify-between gap-3 border-b border-black/[0.04] px-4 py-3">
          <div className="flex min-w-0 items-center gap-2.5">
            <TarineoCopilotAvatar variant="header" alt="" />
            <div className="min-w-0">
              <p className="truncate text-[13px] font-semibold tracking-tight text-ink-900">
                Copilote
              </p>
              <p className="truncate text-[11px] font-medium text-ink-400">
                Point.P · devis-48213.pdf
              </p>
            </div>
          </div>
          <DemoChip />
        </div>

        <div className="flex flex-col gap-3 px-4 py-4">
          <motion.div
            initial={reduce ? false : { opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, ease: LANDING_EASE }}
            className="ml-auto max-w-[88%] rounded-[18px] rounded-br-md bg-ink-900 px-3.5 py-2.5 text-[13px] font-medium leading-snug tracking-[-0.01em] text-paper-0"
          >
            Quelles lignes ont augmenté sur ce devis ?
          </motion.div>

          <motion.div
            initial={reduce ? false : { opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: reduce ? 0 : 0.12, ease: LANDING_EASE }}
            className="flex max-w-[94%] gap-2"
          >
            <TarineoCopilotAvatar variant="message" className="mt-0.5 shrink-0" alt="" />
            <div className="min-w-0 flex-1 rounded-[18px] rounded-tl-md bg-paper-50 px-3.5 py-3 ring-1 ring-black/[0.03]">
              <p className="text-[13px] font-medium leading-snug tracking-[-0.01em] text-ink-800">
                2 hausses au-dessus de 3&nbsp;% — à valider avant devis client.
              </p>
              <ul className="mt-3 flex flex-col gap-2">
                {COPILOTE_LINES.map((line, i) => (
                  <motion.li
                    key={line.label}
                    initial={reduce ? false : { opacity: 0, x: -6 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{
                      duration: 0.3,
                      delay: reduce ? 0 : 0.22 + i * 0.08,
                      ease: LANDING_EASE,
                    }}
                    className="rounded-xl bg-paper-0 px-3 py-2.5 shadow-[0_1px_2px_rgba(97,44,0,0.04)] ring-1 ring-black/[0.04]"
                  >
                    <p className="text-[12px] font-semibold leading-snug text-ink-800">
                      {line.label}
                    </p>
                    <p className="mt-0.5 text-[11px] font-semibold tabular-nums">
                      <span className="text-tarineo-orange">{line.delta}</span>
                      <span className="text-ink-300"> · </span>
                      <span className="font-medium text-ink-500">{line.amount}</span>
                    </p>
                  </motion.li>
                ))}
              </ul>
              <span className="mt-3 inline-flex items-center gap-1 text-[12px] font-semibold text-tarineo-orange">
                Ouvrir le devis
                <ArrowUpRight className="size-3.5" aria-hidden />
              </span>
            </div>
          </motion.div>
        </div>

        <div className="border-t border-black/[0.04] px-3 py-2.5">
          <div className="flex items-center gap-2 rounded-full bg-paper-50 py-1.5 pl-3.5 pr-1.5 ring-1 ring-black/[0.04]">
            <span className="flex-1 truncate text-[12px] font-medium text-ink-300">
              Posez une question…
            </span>
            <span
              className="flex size-8 shrink-0 items-center justify-center rounded-full bg-tarineo-orange text-white shadow-[0_4px_12px_rgba(255,107,26,0.35)]"
              aria-hidden
            >
              <Send className="size-3.5" />
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

function ChantierVisual() {
  const reduce = useReducedMotion();
  const rows = [
    { label: "Devis Point.P", meta: "À négocier", tone: "warn" as const, value: "+8 %" },
    { label: "Devis client", meta: "Prêt à envoyer", tone: "ok" as const, value: "7 171 €" },
    { label: "Relance Cedeo", meta: "Brouillon", tone: "muted" as const, value: "—" },
  ];

  return (
    <div className="w-full max-w-[340px] overflow-hidden rounded-[24px] border border-black/[0.04] bg-paper-0 shadow-[0_16px_40px_rgba(97,44,0,0.12)]">
      <div className="flex items-start justify-between gap-3 border-b border-black/[0.04] px-4 py-3.5">
        <div className="min-w-0">
          <p className="truncate text-[14px] font-semibold tracking-tight text-ink-900">
            Rénovation SDB — Dupont
          </p>
          <p className="mt-0.5 text-[11px] font-medium text-ink-400">3 pièces · Lyon 3e</p>
        </div>
        <span className="shrink-0 rounded-full bg-tarineo-orange/10 px-2.5 py-1 text-[10px] font-semibold text-tarineo-orange">
          En cours
        </span>
      </div>
      <ul className="flex flex-col gap-2 p-3.5">
        {rows.map((row, i) => (
          <motion.li
            key={row.label}
            initial={reduce ? false : { opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: reduce ? 0 : i * 0.07, ease: LANDING_EASE }}
            className="flex items-center gap-2.5 rounded-2xl bg-paper-50 px-3 py-2.5 ring-1 ring-black/[0.03]"
          >
            <span className="flex size-9 items-center justify-center rounded-xl bg-paper-0 shadow-sm ring-1 ring-black/[0.04]">
              <FileText className="size-3.5 text-ink-700" strokeWidth={1.75} aria-hidden />
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-[12px] font-semibold text-ink-800">{row.label}</p>
              <p className="text-[10px] font-medium text-ink-400">{row.meta}</p>
            </div>
            <span
              className={cn(
                "shrink-0 text-[12px] font-semibold tabular-nums",
                row.tone === "warn" && "text-tarineo-orange",
                row.tone === "ok" && "text-ink-800",
                row.tone === "muted" && "text-ink-300",
              )}
            >
              {row.value}
            </span>
          </motion.li>
        ))}
      </ul>
      <div className="flex justify-end px-4 pb-3">
        <DemoChip />
      </div>
    </div>
  );
}

function AlerteVisual() {
  const reduce = useReducedMotion();

  return (
    <div className="w-full max-w-[320px] overflow-hidden rounded-[24px] border border-black/[0.04] bg-paper-0 shadow-[0_16px_40px_rgba(97,44,0,0.12)]">
      <div className="flex items-center justify-between gap-2 border-b border-black/[0.04] px-4 py-3">
        <p className="text-[12px] font-semibold tracking-tight text-ink-900">Hausse détectée</p>
        <DemoChip />
      </div>
      <div className="px-4 py-4">
        <p className="text-[17px] font-semibold tracking-tight text-ink-900">Chauffe-eau 200 L</p>
        <p className="mt-0.5 text-[12px] font-medium text-ink-500">Cedeo · CE-200-STD</p>

        <div className="mt-4 grid grid-cols-2 gap-2">
          <motion.div
            initial={reduce ? false : { opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, ease: LANDING_EASE }}
            className="rounded-2xl bg-paper-50 px-3 py-3 ring-1 ring-black/[0.03]"
          >
            <p className="text-[10px] font-medium text-ink-400">vs habituel</p>
            <p className="mt-1 text-[26px] font-semibold leading-none tracking-tight text-ink-900 nums">
              +12&nbsp;%
            </p>
          </motion.div>
          <motion.div
            initial={reduce ? false : { opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: reduce ? 0 : 0.08, ease: LANDING_EASE }}
            className="rounded-2xl bg-tarineo-orange/10 px-3 py-3 ring-1 ring-tarineo-orange/15"
          >
            <p className="text-[10px] font-medium text-tarineo-orange/80">écart</p>
            <p className="mt-1 text-[26px] font-semibold leading-none tracking-tight text-tarineo-orange nums">
              +92&nbsp;€
            </p>
          </motion.div>
        </div>

        <div className="mt-4 flex items-center justify-between gap-2 text-[11px] font-medium text-ink-400">
          <span className="tabular-nums">676 € → 768 €</span>
          <span className="inline-flex items-center gap-1 font-semibold text-tarineo-orange">
            Vérifier
            <ArrowUpRight className="size-3" aria-hidden />
          </span>
        </div>
      </div>
    </div>
  );
}

function DocsGridVisual() {
  const reduce = useReducedMotion();

  return (
    <div className="relative w-full max-w-[360px]">
      <div className="relative overflow-hidden rounded-[24px] border border-black/[0.04] bg-paper-0 shadow-[0_16px_40px_rgba(97,44,0,0.12)]">
        <div className="flex items-center justify-between gap-2 border-b border-black/[0.04] px-4 py-3">
          <div className="flex min-w-0 items-center gap-2.5">
            <span className="flex size-9 items-center justify-center rounded-xl bg-tarineo-orange/10 text-tarineo-orange ring-1 ring-tarineo-orange/15">
              <FileText className="size-4" strokeWidth={1.75} aria-hidden />
            </span>
            <div className="min-w-0">
              <p className="truncate text-[13px] font-semibold tracking-tight text-ink-900">
                devis-48213.pdf
              </p>
              <p className="text-[11px] font-medium text-ink-400">Point.P · 3 lignes lues</p>
            </div>
          </div>
          <DemoChip />
        </div>

        <div className="relative px-4 pb-4 pt-3">
          <div className="relative overflow-hidden rounded-2xl bg-paper-50 ring-1 ring-black/[0.03]">
            <div className="space-y-2 px-3.5 py-3">
              <div className="h-2 w-2/3 rounded-full bg-ink-900/8" />
              <div className="h-2 w-1/2 rounded-full bg-ink-900/6" />
              <div className="h-2 w-4/5 rounded-full bg-ink-900/5" />
            </div>
            {!reduce ? (
              <motion.div
                aria-hidden
                className="pointer-events-none absolute inset-x-0 h-10 bg-[linear-gradient(180deg,transparent,rgba(255,107,26,0.18),transparent)]"
                initial={{ top: "-10%" }}
                animate={{ top: ["-10%", "110%"] }}
                transition={{ duration: 2.4, ease: "easeInOut", repeat: Infinity, repeatDelay: 0.8 }}
              />
            ) : null}
          </div>

          <ul className="mt-3 flex flex-col gap-1.5">
            {EXTRACTED_LINES.map((line, i) => (
              <motion.li
                key={line.label}
                initial={reduce ? false : { opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  duration: 0.35,
                  delay: reduce ? 0 : 0.15 + i * 0.1,
                  ease: LANDING_EASE,
                }}
                className="flex items-center gap-2 rounded-xl bg-paper-0 px-3 py-2 shadow-[0_1px_2px_rgba(97,44,0,0.04)] ring-1 ring-black/[0.04]"
              >
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[12px] font-semibold text-ink-800">{line.label}</p>
                  <p className="text-[10px] font-medium text-ink-400">
                    Qté {line.qty} · PU {line.pu}
                  </p>
                </div>
                {line.flag ? (
                  <span className="shrink-0 rounded-full bg-tarineo-orange/10 px-2 py-0.5 text-[10px] font-semibold text-tarineo-orange">
                    Hausse
                  </span>
                ) : (
                  <span className="shrink-0 rounded-full bg-paper-50 px-2 py-0.5 text-[10px] font-semibold text-ink-400">
                    OK
                  </span>
                )}
              </motion.li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
