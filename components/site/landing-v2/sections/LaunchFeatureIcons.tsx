"use client";

import Image from "next/image";
import type { ReactNode } from "react";
import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useInView, useReducedMotion } from "framer-motion";

import { LandingFigmaSectionHeader } from "@/components/site/landing-v2/components/ui/LandingFigmaSectionHeader";
import { LANDING_EASE, LandingStagger, LandingStaggerItem } from "@/components/site/landing-v2/lib/landing-motion";
import { launchFeatureIcons } from "@/lib/site/landing-v2-content";
import { cn } from "@/lib/utils";

const ASSETS = {
  badge: "/landing/figma/preuve/badge-doc.svg",
  pdfA: "/landing/figma/preuve/pdf-thumb-a.svg",
  pdfB: "/landing/figma/preuve/pdf-thumb-b.svg",
  plus: "/landing/figma/preuve/plus.svg",
  check: "/landing/figma/preuve/check.svg",
  file: "/landing/figma/preuve/file-doc.svg",
  invoice: "/landing/figma/preuve/file-invoice.svg",
  thunder: "/landing/figma/preuve/thunder.svg",
  avatar1: "/landing/figma/preuve/avatar-1.jpg",
  avatar2: "/landing/figma/preuve/avatar-2.jpg",
  marginDotGlow: "/landing/figma/preuve/margin-dot-glow.svg",
  marginDotCore: "/landing/figma/preuve/margin-dot-core.svg",
  mascotPc: "/landing/v2/mascots/mascot-ordinateur.webp",
  mascotOk: "/landing/v2/mascots/mascot-pouce-leve.webp",
} as const;

const CARD_SHADOW =
  "shadow-[0_7px_15px_rgba(179,179,179,0.1),0_26px_26px_rgba(179,179,179,0.09),0_59px_35px_rgba(179,179,179,0.05)]";

const MOCK_SHADOW =
  "shadow-[0_2px_4px_rgba(199,199,199,0.1),0_7px_7px_rgba(199,199,199,0.09),0_17px_10px_rgba(199,199,199,0.05)]";

const RECAP = [
  { label: "Enseigne reconnue", hint: "Point.P" },
  { label: "Émetteur / destinataire lu" },
  { label: "N° de document" },
  { label: "Total HT lu" },
  { label: "Lignes ↔ total HT", hint: "Écart ≤ 3 %." },
  { label: "Lignes produits", hint: "5" },
  { label: "Lisibilité du fichier", hint: "Document net" },
] as const;

const DOCS = [
  { label: "Devis Distributeurs", icon: "file" as const, thunder: true, bar: "w-12" },
  { label: "Devis Clients", icon: "file" as const, thunder: true, bar: "w-8" },
  { label: "Facture Clients", icon: "invoice" as const, thunder: false, bar: "w-16" },
] as const;

/**
 * Section #fonctionnalites — Figma 235:34328 (Isometric Team).
 * Cartes droites, copy métier, mocks produit — pas de dump Anima 1440.
 */
export function LaunchFeatureIcons() {
  const reduce = useReducedMotion();
  const [analyse, copilote, devis] = launchFeatureIcons.cards;

  return (
    <section
      id="fonctionnalites"
      className="relative pt-4 pb-10 sm:pt-6 sm:pb-14 lg:pt-6 lg:pb-16"
    >
      <div className="shell">
        <div
          className={cn(
            "relative overflow-hidden rounded-[32px]",
            "bg-[radial-gradient(953px_1394px_at_85.3%_4.3%,rgba(190,190,190,0.12)_0%,rgba(255,255,255,0)_61.54%),#fafafa]",
            "shadow-[inset_0_-1px_0_0_rgba(0,0,0,0.1)]",
          )}
        >
          <div className="relative z-[1] flex flex-col gap-10 px-5 py-10 sm:px-10 sm:py-12 lg:gap-12 lg:px-[56px] lg:py-16">
            <LandingFigmaSectionHeader
              badge={launchFeatureIcons.badge}
              badgeIcon={ASSETS.badge}
              title={launchFeatureIcons.title}
              subtitle={launchFeatureIcons.subtitle}
            />

            <LandingStagger
              className="grid w-full gap-5 sm:grid-cols-2 lg:grid-cols-3 lg:gap-6"
              stagger={0.08}
            >
              <LandingStaggerItem>
                <FeatureCard reduce={!!reduce} kicker={analyse.kicker} title={analyse.title} text={analyse.text}>
                  <AnalyseMock />
                </FeatureCard>
              </LandingStaggerItem>
              <LandingStaggerItem>
                <FeatureCard reduce={!!reduce} kicker={copilote.kicker} title={copilote.title} text={copilote.text}>
                  <CopiloteMock />
                </FeatureCard>
              </LandingStaggerItem>
              <LandingStaggerItem className="sm:col-span-2 lg:col-span-1">
                <FeatureCard reduce={!!reduce} kicker={devis.kicker} title={devis.title} text={devis.text}>
                  <DevisMock />
                </FeatureCard>
              </LandingStaggerItem>
            </LandingStagger>
          </div>
        </div>
      </div>
    </section>
  );
}

function FeatureCard({
  kicker,
  title,
  text,
  children,
  reduce,
}: {
  kicker: string;
  title: string;
  text: string;
  children: ReactNode;
  reduce: boolean;
}) {
  return (
    <motion.article
      whileHover={
        reduce ? undefined : { y: -4, transition: { type: "spring", stiffness: 380, damping: 28 } }
      }
      className={cn(
        "flex h-full min-h-[420px] flex-col overflow-hidden rounded-[18px] bg-[#f5f5f5] p-[18px] outline outline-[3px] outline-white",
        CARD_SHADOW,
      )}
    >
      <p className="text-[15px] font-semibold uppercase leading-snug tracking-tight text-[#1a1a1a]">
        {kicker}
      </p>
      <div className="relative flex min-h-[210px] flex-1 items-center justify-center py-4">{children}</div>
      <h3 className="text-[17px] font-semibold leading-snug tracking-tight text-[#1a1a1a]">{title}</h3>
      <p className="mt-1.5 text-xs font-medium leading-[15px] text-[#8e8e8e]">{text}</p>
    </motion.article>
  );
}

function AnalyseMock() {
  return (
    <div aria-hidden className="relative w-[238px]">
      <div
        className={cn(
          "relative h-[135px] overflow-hidden rounded-[9px] bg-white outline outline-1 outline-[#f0f0f0]",
          MOCK_SHADOW,
        )}
      >
        <div className="absolute left-3 top-3 inline-flex h-[27px] items-center gap-1 rounded-full bg-[#f2f2f2] px-[13px]">
          <Image src={ASSETS.plus} alt="" width={13} height={13} />
          <span className="text-[12px] font-medium text-[#b3b3b3]">Create a plan</span>
        </div>
        <Image
          src={ASSETS.pdfB}
          alt=""
          width={53}
          height={78}
          className="absolute left-3 top-12 h-[78px] w-[53px]"
        />
        <Image
          src={ASSETS.pdfA}
          alt=""
          width={54}
          height={78}
          className="absolute left-[74px] top-12 h-[78px] w-[54px]"
        />
        <div className="absolute right-3 top-3 flex h-[114px] w-[89px] flex-col overflow-hidden rounded-[6px] bg-[#f2f2f2] px-[7px] pb-1 pt-2">
          <p className="text-[6.5px] font-medium leading-none text-[#0a0a0a]">Récapitulatif agent</p>
          <p className="mt-1.5 text-[6.5px] leading-[7.5px] tracking-[-0.02em] text-[#0a0a0a]">
            Facture n°2021-4975-AB émise par Point.P Bagnères-de-Bigorre,
          </p>
          <ul className="mt-2 flex flex-col gap-[2px]">
            {RECAP.map((row) => (
              <li key={row.label} className="flex items-start gap-[2px]">
                <Image src={ASSETS.check} alt="" width={5} height={5} className="mt-px shrink-0" />
                <span className="text-[6.5px] font-medium leading-[5.8px] tracking-[-0.02em] text-[#0a0a0a]">
                  {row.label}
                  {"hint" in row && row.hint ? (
                    <span className="font-normal text-[#6e6e6e]"> — {row.hint}</span>
                  ) : null}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>
      <span className="absolute left-1/2 top-[112px] flex size-[52px] -translate-x-1/2 items-center justify-center overflow-hidden rounded-full bg-gradient-to-b from-white from-[-7%] to-[#ff6b1a] to-[113%] outline outline-[3px] outline-white shadow-[0_1px_3px_rgba(133,133,133,0.1),0_6px_6px_rgba(133,133,133,0.09)]">
        <Image src={ASSETS.mascotPc} alt="" width={41} height={37} className="h-[37px] w-[41px] object-contain" />
      </span>
    </div>
  );
}

const COPILOTE_STEP_MS = 820;
const COPILOTE_MESSAGE_COUNT = 4;

function CopiloteTypingDots() {
  const reduce = useReducedMotion();
  return (
    <span className="flex items-center gap-1.5 px-1">
      {[0, 1, 2].map((i) => (
        <motion.span
          key={i}
          className="size-[7px] rounded-full bg-[#ff6b1a]"
          animate={reduce ? undefined : { opacity: [0.35, 1, 0.35] }}
          transition={
            reduce
              ? undefined
              : { duration: 0.75, repeat: Infinity, ease: "easeInOut", delay: i * 0.12 }
          }
        />
      ))}
    </span>
  );
}

function CopiloteChatBubble({
  step,
  showStep,
  children,
}: {
  step: number;
  showStep: number;
  children: ReactNode;
}) {
  const reduce = useReducedMotion();

  return (
    <AnimatePresence mode="wait">
      {showStep >= step ? (
        <motion.div
          key={step}
          initial={reduce ? false : { opacity: 0, y: 8, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={reduce ? undefined : { opacity: 0, y: -4, scale: 0.98 }}
          transition={{ duration: 0.32, ease: LANDING_EASE }}
        >
          {children}
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}

function CopiloteMock() {
  const reduce = useReducedMotion();
  const rootRef = useRef<HTMLDivElement>(null);
  const inView = useInView(rootRef, { margin: "-15% 0px" });
  const [step, setStep] = useState(reduce ? COPILOTE_MESSAGE_COUNT : 0);

  useEffect(() => {
    if (!inView) return;
    if (reduce) {
      setStep(COPILOTE_MESSAGE_COUNT);
      return;
    }

    setStep(0);
    const id = window.setInterval(() => {
      setStep((prev) => (prev >= COPILOTE_MESSAGE_COUNT ? 0 : prev + 1));
    }, COPILOTE_STEP_MS);

    return () => window.clearInterval(id);
  }, [inView, reduce]);

  return (
    <div ref={rootRef} aria-hidden className="relative w-full max-w-[280px]">
      <div className="absolute left-1/2 top-0 z-[1] -translate-x-1/2">
        <div className="flex h-[30px] items-center gap-1.5 overflow-hidden rounded-full bg-gradient-to-b from-white from-[-7%] to-[#ff6b1a] to-[113%] pl-[14px] pr-1 outline outline-[1.5px] outline-white shadow-[0_1px_3px_rgba(56,56,56,0.1),0_6px_6px_rgba(56,56,56,0.09)]">
          <span className="text-[15px] font-semibold leading-[22px] text-white">Copilote</span>
          <Image src={ASSETS.mascotPc} alt="" width={22} height={19} className="h-[19px] w-[22px] object-contain" />
        </div>
      </div>

      <div className="mt-11 flex min-h-[148px] flex-col gap-2.5">
        <CopiloteChatBubble step={1} showStep={step}>
          <ChatRow align="right" avatar={ASSETS.avatar1} artisan>
            <p className="text-[9px] font-semibold leading-[14px] text-[#0a0a0a]">
              Quelles lignes ont augmenté sur ce devis ?
            </p>
          </ChatRow>
        </CopiloteChatBubble>
        <CopiloteChatBubble step={2} showStep={step}>
          <ChatRow align="left" mascot>
            <p className="text-[9px] font-semibold leading-[14px] text-[#0a0a0a]">
              2 hausses au-dessus de 3&nbsp;% — à valider avant devis client.
            </p>
          </ChatRow>
        </CopiloteChatBubble>
        <CopiloteChatBubble step={3} showStep={step}>
          <ChatRow align="right" avatar={ASSETS.avatar2} artisan>
            <span className="flex h-[14px] items-end gap-[5px] pr-1">
              <span className="mb-0.5 h-[2px] w-[42px] rounded-full bg-[#e8e8e8]" />
              <span className="text-[15px] leading-none">😀</span>
            </span>
          </ChatRow>
        </CopiloteChatBubble>
        <CopiloteChatBubble step={4} showStep={step}>
          <ChatRow align="left" mascot>
            <CopiloteTypingDots />
          </ChatRow>
        </CopiloteChatBubble>
      </div>
    </div>
  );
}

function ChatRow({
  align,
  avatar,
  artisan,
  mascot,
  children,
}: {
  align: "left" | "right";
  avatar?: string;
  artisan?: boolean;
  mascot?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className={cn("flex items-center gap-2", align === "right" && "flex-row-reverse")}>
      {mascot ? (
        <span className="flex size-[30px] shrink-0 items-center justify-center overflow-hidden rounded-full bg-gradient-to-b from-white from-[-7%] to-[#ff6b1a] to-[113%] outline outline-1 outline-[#e6e6e6]">
          <Image src={ASSETS.mascotPc} alt="" width={22} height={19} className="h-[19px] w-[22px] object-contain" />
        </span>
      ) : artisan && avatar ? (
        <span className="relative size-[30px] shrink-0 overflow-hidden rounded-full outline outline-1 outline-[#e6e6e6]">
          <Image src={avatar} alt="" fill sizes="30px" className="object-cover" />
        </span>
      ) : null}
      <div
        className={cn(
          "rounded-full bg-white px-3.5 py-1.5 outline outline-1 outline-[#f0f0f0]",
          MOCK_SHADOW,
        )}
      >
        {children}
      </div>
    </div>
  );
}

function DevisMock() {
  return (
    <div aria-hidden className="relative w-[232px]">
      <div
        className={cn(
          "flex flex-col gap-2 rounded-xl bg-white p-2.5 outline outline-1 outline-[#f0f0f0]",
          MOCK_SHADOW,
        )}
      >
        {DOCS.map((row) => (
          <div key={row.label} className="relative flex h-[46px] items-center gap-2 rounded-md bg-[#f0f0f0] px-1">
            <Image
              src={row.icon === "invoice" ? ASSETS.invoice : ASSETS.file}
              alt=""
              width={36}
              height={36}
              className="size-9"
            />
            <div className="min-w-0 flex-1">
              <p className="text-[10px] font-semibold text-[#8c8b8b]">{row.label}</p>
              <span className={cn("mt-1 block h-[5px] rounded-full bg-[#e4e4e4]", row.bar)} />
            </div>
            {row.thunder ? (
              <Image src={ASSETS.thunder} alt="" width={18} height={18} className="mr-1 size-[18px]" />
            ) : null}
          </div>
        ))}
      </div>
      <div
        className={cn(
          "absolute -right-1 bottom-[-10px] h-[117px] w-[100px] overflow-hidden rounded-[12px] border-[1.5px] border-white",
          "bg-[linear-gradient(180deg,#585858_17.59%,#2f2f2f_100%)]",
          "shadow-[0px_1.5px_3px_rgba(56,56,56,0.1),0px_6px_6px_rgba(56,56,56,0.09),0px_13px_8px_rgba(56,56,56,0.05),0px_25px_10px_rgba(56,56,56,0.01)]",
        )}
      >
        <span className="absolute left-[9px] top-3 size-[4.5px]">
          <Image
            src={ASSETS.marginDotGlow}
            alt=""
            width={14}
            height={14}
            className="absolute -inset-[148%] max-w-none"
            aria-hidden
          />
          <Image
            src={ASSETS.marginDotCore}
            alt=""
            width={5}
            height={5}
            className="absolute inset-0 size-full"
            aria-hidden
          />
        </span>
        <div className="px-1 pb-2 pt-[26px]">
          <p className="text-[8.8px] font-semibold leading-none text-white">Marge estimée — 28 %</p>
          <p className="mt-2 text-[8.2px] font-semibold leading-none text-white">Prix fournisseur — 850 €</p>
          <p className="mt-2 text-[8.2px] font-semibold leading-none text-white">Prix de vente — 1 190 €</p>
          <p className="mt-6 max-w-[4.85rem] text-[8.2px] font-semibold leading-[11px] text-white">
            Vos devis, prêts à être rentables.
          </p>
        </div>
        <Image
          src={ASSETS.mascotOk}
          alt=""
          width={32}
          height={34}
          className="absolute bottom-[2px] right-0 h-[34px] w-[32px] object-contain object-bottom"
        />
      </div>
    </div>
  );
}
