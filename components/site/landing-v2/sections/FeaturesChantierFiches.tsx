"use client";

import Image from "next/image";
import {
  AnimatePresence,
  motion,
  useMotionValueEvent,
  useReducedMotion,
  useScroll,
} from "framer-motion";
import { useRef, useState, type CSSProperties } from "react";

import { LandingFigmaSectionHeader } from "@/components/site/landing-v2/components/ui/LandingFigmaSectionHeader";
import { LANDING_EASE } from "@/components/site/landing-v2/lib/landing-motion";
import { landingFeaturesFiches } from "@/lib/site/landing-v2-content";
import { DEMO_MARK } from "@/lib/site/tarineo";
import { cn } from "@/lib/utils";

type Fiche = (typeof landingFeaturesFiches.items)[number];

const ASSETS = {
  icon: "/landing/figma/features/icon-fiche.svg",
  lines: "/landing/figma/features/iso-lines.svg",
  filletTop: "/landing/figma/features/fillet-top.svg",
  filletBottom: "/landing/figma/features/fillet-bottom.svg",
} as const;

const SWAP = {
  duration: 0.42,
  ease: LANDING_EASE,
} as const;

const DOT: Record<Fiche["statusTone"], string> = {
  focus: "bg-[#77f673]",
  pause: "bg-[#ffcc66]",
  fini: "bg-[#c6c6c6]",
};

/** ~32vh de scroll par fiche après la 1ʳᵉ — pas de 240vh vide. */
const PIN_SCROLL_VH_PER_SLIDE = 32;

/**
 * Board « Suivi chantier » — 3 fiches, scroll sticky desktop + swap animé.
 */
export function FeaturesChantierFiches() {
  const pinRef = useRef<HTMLDivElement>(null);
  const indexRef = useRef(0);
  const [activeId, setActiveId] = useState<Fiche["id"]>(landingFeaturesFiches.items[0].id);
  const [dir, setDir] = useState(1);
  const reduce = useReducedMotion();
  const items = landingFeaturesFiches.items;
  const index = Math.max(0, items.findIndex((item) => item.id === activeId));
  const active = items[index] ?? items[0];
  indexRef.current = index;

  const { scrollYProgress } = useScroll({
    target: pinRef,
    offset: ["start start", "end end"],
  });

  useMotionValueEvent(scrollYProgress, "change", (value) => {
    if (reduce) return;
    if (typeof window !== "undefined" && window.matchMedia("(max-width: 1023px)").matches) {
      return;
    }
    const n = items.length;
    const scaled = Math.min(n - 0.001, Math.max(0, value) * n);
    const next = Math.floor(scaled);
    if (next === indexRef.current) return;
    setDir(next > indexRef.current ? 1 : -1);
    indexRef.current = next;
    setActiveId(items[next].id);
  });

  function select(id: Fiche["id"]) {
    const next = items.findIndex((item) => item.id === id);
    if (next === index || next < 0) return;

    const pin = pinRef.current;
    const canPin =
      !reduce &&
      pin &&
      typeof window !== "undefined" &&
      window.matchMedia("(min-width: 1024px)").matches;

    if (canPin) {
      const start = window.scrollY + pin.getBoundingClientRect().top;
      const span = Math.max(1, pin.offsetHeight - window.innerHeight);
      window.scrollTo({
        top: start + ((next + 0.35) / items.length) * span,
        behavior: "smooth",
      });
      return;
    }

    setDir(next > index ? 1 : -1);
    setActiveId(id);
  }

  const pinScrollVh = (items.length - 1) * PIN_SCROLL_VH_PER_SLIDE;

  return (
    <div
      ref={pinRef}
      className="lg:h-[calc(100dvh+var(--pin-scroll,0vh))] lg:rounded-[32px] lg:bg-[#fafafa]"
      style={
        pinScrollVh > 0
          ? ({ ["--pin-scroll" as string]: `${pinScrollVh}vh` } as CSSProperties)
          : undefined
      }
    >
      <div
        className={cn(
          "relative overflow-hidden rounded-[32px] lg:sticky lg:top-20",
          "bg-[radial-gradient(953px_1356px_at_85.3%_4.3%,rgba(190,190,190,0.12)_0%,rgba(255,255,255,0)_61.54%),#fafafa]",
          "shadow-[inset_0_-1px_0_0_rgba(0,0,0,0.1)]",
          "lg:min-h-[calc(100dvh-5rem)]",
        )}
      >
        <div className="flex flex-col gap-10 px-5 py-10 sm:px-10 sm:py-12 lg:flex-row lg:items-center lg:justify-between lg:gap-6 lg:px-[72px] lg:py-16 lg:min-h-[calc(100dvh-5rem)]">
        <div className="flex w-full max-w-[539px] flex-col gap-8 lg:gap-12">
          <LandingFigmaSectionHeader
            badge={landingFeaturesFiches.badge}
            badgeIcon={ASSETS.icon}
            title={
              <>
                {landingFeaturesFiches.titleLead}
                <span className="text-[#ff6b1a]">{landingFeaturesFiches.titleAccent}</span>
                {landingFeaturesFiches.titleTail}
              </>
            }
            subtitle={
              <>
                {landingFeaturesFiches.subtitle}
                <span className="ml-2 rounded-full bg-[#f4f4f4] px-2 py-0.5 text-[11px] font-semibold text-[#8c8c8c]">
                  {DEMO_MARK}
                </span>
              </>
            }
          />

          <div
            role="listbox"
            aria-label="Fiches chantier d’exemple"
            className="flex flex-col shadow-[inset_-1px_0_0_0_rgba(0,0,0,0.08)] lg:max-w-[400px]"
          >
            {items.map((item) => {
              const selected = item.id === active.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  role="option"
                  aria-selected={selected}
                  onClick={() => select(item.id)}
                  className={cn(
                    "relative flex w-full items-center gap-3.5 p-[22px] text-left outline-none",
                    "focus-visible:ring-2 focus-visible:ring-[#ff6b1a]/45 focus-visible:ring-offset-2",
                    !selected && "hover:bg-white/60",
                  )}
                >
                  {selected ? (
                    <motion.span
                      layoutId={reduce ? undefined : "fiche-active-bg"}
                      className="absolute inset-0 rounded-[20px_0_0_20px] bg-white shadow-[0_3px_3px_rgba(0,0,0,0.02),0_1px_1px_rgba(0,0,0,0.05),0_11px_23px_rgba(207,207,207,0.12)]"
                      transition={{ type: "spring", stiffness: 380, damping: 34 }}
                    />
                  ) : null}
                  <span className="relative z-[1] size-12 shrink-0 overflow-hidden rounded-[10px] bg-[#eee] ring-1 ring-black/5">
                    <Image
                      src={item.cover}
                      alt=""
                      fill
                      sizes="48px"
                      className="object-cover"
                    />
                  </span>
                  <span className="relative z-[1] min-w-0 flex-1">
                    <span className="block text-[15px] font-semibold leading-5 tracking-tight text-[#141414]">
                      {item.title}
                    </span>
                    <span className="mt-1 block text-[13px] leading-[18px] text-[#8c8c8c]">
                      {item.excerpt}
                    </span>
                  </span>
                  {selected ? (
                    <>
                      <span
                        aria-hidden
                        className="absolute -right-[9px] top-1/2 z-[2] hidden h-[104px] w-[7px] -translate-y-1/2 overflow-hidden rounded-[62px] bg-[#0a0a0a] outline outline-2 outline-[#0a0a0a] lg:block"
                      >
                        <span className="absolute -left-[3px] -top-1 h-[42px] w-[13px] rounded-full bg-[#ff6b1a]" />
                      </span>
                      <Image
                        src={ASSETS.filletTop}
                        alt=""
                        width={67}
                        height={38}
                        aria-hidden
                        className="pointer-events-none absolute -top-[38px] right-0 z-[2] hidden lg:block"
                      />
                      <Image
                        src={ASSETS.filletBottom}
                        alt=""
                        width={67}
                        height={38}
                        aria-hidden
                        className="pointer-events-none absolute right-0 top-full z-[2] hidden lg:block"
                      />
                    </>
                  ) : null}
                </button>
              );
            })}
          </div>
        </div>

        <div className="hidden min-w-0 flex-1 lg:block">
          <IsoStage fiche={active} dir={dir} reduce={Boolean(reduce)} />
        </div>

        <div className="lg:hidden">
          <IsoCardFlat fiche={active} dir={dir} reduce={Boolean(reduce)} />
        </div>
      </div>
      </div>
    </div>
  );
}

function IsoStage({
  fiche,
  dir,
  reduce,
}: {
  fiche: Fiche;
  dir: number;
  reduce: boolean;
}) {
  return (
    <div className="@container relative mx-auto w-full max-w-[640px] pt-8">
      <div className="relative aspect-[679/620] w-full">
        <div className="absolute left-0 top-0 h-[703px] w-[679px] origin-top-left [transform:scale(calc(100cqw/679))]">
          <IsoGhost className="left-[259px] top-[68px]" />
          <IsoGhost className="left-[214px] top-[94px]" />
          <IsoGhost className="left-[168px] top-[118px]" />
          <div
            className="absolute left-[48px] top-0 h-[500px] w-[420px]"
            style={{
              filter:
                "drop-shadow(3px 9px 21px rgba(184,183,183,0.12)) drop-shadow(11px 37px 39px rgba(184,183,183,0.1))",
            }}
          >
            <AnimatePresence mode="wait" custom={dir}>
              <motion.div
                key={fiche.id}
                custom={dir}
                initial={
                  reduce
                    ? { opacity: 0 }
                    : { opacity: 0, x: dir * 28, y: dir * 16, rotate: dir * 3.5, scale: 0.97 }
                }
                animate={{ opacity: 1, x: 0, y: 0, rotate: 0, scale: 1 }}
                exit={
                  reduce
                    ? { opacity: 0 }
                    : { opacity: 0, x: dir * -22, y: dir * -12, rotate: dir * -2.5, scale: 0.98 }
                }
                transition={SWAP}
                className="absolute inset-0 origin-[40%_60%]"
              >
                <IsoFilled fiche={fiche} reduce={reduce} />
              </motion.div>
            </AnimatePresence>
            <IsoGhost className="left-[-70px] top-[430px]" />
          </div>
        </div>
      </div>
    </div>
  );
}

function IsoGhost({ className }: { className?: string }) {
  return (
    <div className={cn("absolute h-[467px] w-[351px]", className)} aria-hidden>
      <div
        className="absolute left-0 top-[19px] h-[280px] w-[400px] origin-top-left rounded-[8px] bg-[rgba(193,193,193,0.01)] outline outline-1 outline-[#ccc] backdrop-blur-[2px]"
        style={{ transform: "matrix(0.866, 0.5, 0, 1, 0, 0)" }}
      />
      <div
        className="absolute left-8 top-0 h-[40px] w-[400px] origin-top-left rounded-[8px] bg-[rgba(229,229,229,0.2)] outline outline-1 outline-[#ccc] backdrop-blur-[6px]"
        style={{ transform: "matrix(0.866, 0.5, -0.866, 0.5, 0, 0)" }}
      />
      <div
        className="absolute left-[346px] top-[220px] h-[280px] w-[36px] origin-top-left rounded-[8px] bg-[rgba(229,229,229,0.2)] outline outline-1 outline-[#ccc] backdrop-blur-[6px]"
        style={{ transform: "matrix(0.866, -0.5, 0, 1, 0, 0)" }}
      />
    </div>
  );
}

function IsoFilled({ fiche, reduce }: { fiche: Fiche; reduce: boolean }) {
  return (
    <div className="absolute inset-0">
      <div
        className="absolute left-0 top-[22px] h-[300px] w-[420px] origin-top-left"
        style={{ transform: "matrix(0.866, 0.5, 0, 1, 0, 0)" }}
      >
        <div className="absolute inset-0 rounded-[8px] bg-white outline outline-1 outline-[#ccc]" />
        <div className="absolute inset-[8px] overflow-hidden rounded-[6px] outline outline-1 outline-[#e8e8e8]">
          <div className="flex h-full">
            <div className="relative h-full w-[188px] shrink-0">
              <motion.div
                key={fiche.cover}
                className="absolute inset-0"
                initial={reduce ? false : { scale: 1.08 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.55, ease: LANDING_EASE }}
              >
                <Image
                  src={fiche.cover}
                  alt={`${fiche.title} — ${fiche.clientLine}`}
                  fill
                  sizes="188px"
                  className="object-cover"
                  priority={fiche.id === landingFeaturesFiches.defaultId}
                />
              </motion.div>
              <span className="absolute left-2.5 top-2.5 inline-flex items-center gap-1.5 rounded-[5px] bg-white/95 px-2 py-1 shadow-[0_1px_2px_rgba(0,0,0,0.12)]">
                <span className={cn("size-1.5 rounded-full", DOT[fiche.statusTone])} />
                <span className="text-[11px] font-semibold leading-none text-[#1a1a1a]">
                  {fiche.status}
                </span>
              </span>
            </div>
            <div className="flex min-w-0 flex-1 flex-col bg-[#f6f7f9] px-3.5 py-3">
              <span className="w-fit rounded-[5px] bg-[#ff6b1a] px-2 py-1 text-[11px] font-semibold leading-none text-white shadow-[0_1px_1px_rgba(0,0,0,0.15)]">
                Chantier
              </span>
              <p className="mt-2.5 text-[17px] font-semibold leading-[1.25] tracking-tight text-[#141414]">
                {fiche.title}
              </p>
              <p className="mt-1 text-[13px] font-medium leading-[18px] text-[#71717a]">
                {fiche.clientLine}
              </p>
              <Image
                src={ASSETS.lines}
                alt=""
                width={133}
                height={77}
                className="mt-3 h-12 w-full opacity-80"
              />
              <p className="mt-2 text-[13px] leading-[18px] text-[#5c5c5c]">{fiche.body}</p>
              <div className="mt-auto flex flex-wrap gap-1.5 pt-3">
                {fiche.tags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-[5px] bg-white px-2 py-1 text-[11px] font-semibold text-[#ff6b1a] shadow-[0_1px_1px_rgba(0,0,0,0.12)]"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
      <div
        className="absolute left-9 top-0 h-[42px] w-[420px] origin-top-left rounded-[8px] bg-[#fffdfd] outline outline-1 outline-[#ccc]"
        style={{ transform: "matrix(0.866, 0.5, -0.866, 0.5, 0, 0)" }}
      />
      <div
        className="absolute left-[364px] top-[228px] h-[300px] w-[38px] origin-top-left rounded-[8px] bg-[#fffdfd] outline outline-1 outline-[#ccc]"
        style={{ transform: "matrix(0.866, -0.5, 0, 1, 0, 0)" }}
      />
    </div>
  );
}

function IsoCardFlat({
  fiche,
  dir,
  reduce,
}: {
  fiche: Fiche;
  dir: number;
  reduce: boolean;
}) {
  return (
    <div className="relative min-h-[176px]">
      <AnimatePresence mode="wait" custom={dir}>
        <motion.article
          key={fiche.id}
          initial={reduce ? { opacity: 0 } : { opacity: 0, y: dir * 12, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={reduce ? { opacity: 0 } : { opacity: 0, y: dir * -10, scale: 0.98 }}
          transition={SWAP}
          className="overflow-hidden rounded-[16px] border border-[#e5e5e5] bg-white shadow-[0_11px_23px_rgba(207,207,207,0.18)]"
        >
          <div className="flex gap-3 p-3">
            <Image
              src={fiche.cover}
              alt={`${fiche.title} — ${fiche.clientLine}`}
              width={112}
              height={148}
              className="h-[148px] w-[112px] shrink-0 rounded-[8px] object-cover"
            />
            <div className="min-w-0 flex-1 py-1">
              <p className="text-[15px] font-semibold leading-5 text-[#141414]">{fiche.title}</p>
              <p className="mt-1 text-[12px] font-medium text-[#71717a]">{fiche.clientLine}</p>
              <p className="mt-3 text-[13px] leading-5 text-[#5c5c5c]">{fiche.body}</p>
              <div className="mt-3 flex flex-wrap gap-1">
                {fiche.tags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-[4px] bg-[#fff4ee] px-1.5 py-0.5 text-[11px] font-medium text-[#ff6b1a]"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </motion.article>
      </AnimatePresence>
    </div>
  );
}
