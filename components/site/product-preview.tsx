"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ArrowUp, Bot, House, LayoutDashboard, LayoutGrid, Search } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { ActionCards } from "@/components/home/action-cards";
import { GlowCard } from "@/components/home/glow-card";
import { Mascot } from "@/components/home/mascot";
import { Illustration } from "@/components/illustration";
import { EASE } from "@/components/motion/reveal";
import { ProjectCard } from "@/components/projects/project-card";
import { PageHead } from "@/components/shell/page-head";
import { BRAND } from "@/lib/brand";
import { TABS } from "@/lib/nav";
import { cn } from "@/lib/utils";
import { DEMO_ACTIONS, DEMO_PROJECTS } from "./product-preview-demo";
import { AI_STORY, DEMO_QUESTION, DEMO_REPLY, type PreviewMode } from "./product-preview-story";

const STEP_MS = 6500;

/** Aperçu marketing : shell réel + bonhomme qui explique le copilote IA étape par étape. */
export function ProductPreview() {
  const reduce = useReducedMotion();
  const [step, setStep] = useState(0);
  const [paused, setPaused] = useState(false);
  const [typed, setTyped] = useState("");
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);

  const story = AI_STORY[step] ?? AI_STORY[0];
  const activePath = story.path;

  const advance = useCallback(() => {
    setStep((i) => (i + 1) % AI_STORY.length);
  }, []);

  useEffect(() => {
    if (paused || reduce) return;
    timer.current = setInterval(advance, STEP_MS);
    return () => {
      if (timer.current) clearInterval(timer.current);
    };
  }, [paused, reduce, advance, step]);

  useEffect(() => {
    if (story.mode !== "typing" && story.mode !== "context") {
      setTyped(DEMO_QUESTION);
      return;
    }
    setTyped("");
    let i = 0;
    const tick = window.setInterval(() => {
      i += 1;
      setTyped(DEMO_QUESTION.slice(0, i));
      if (i >= DEMO_QUESTION.length) clearInterval(tick);
    }, 28);
    return () => clearInterval(tick);
  }, [step, story.mode]);

  return (
    <div
      className="flex flex-col gap-4"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={story.id}
          role="region"
          aria-label={story.title}
          aria-live="polite"
          initial={reduce ? { opacity: 0 } : { opacity: 0, y: 10, filter: "blur(4px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          exit={reduce ? { opacity: 0 } : { opacity: 0, y: -6, filter: "blur(4px)" }}
          transition={{ duration: 0.4, ease: EASE }}
          className="card-soft flex flex-col gap-4 p-4 sm:flex-row sm:items-start sm:gap-5 sm:p-5"
        >
          <motion.div
            initial={reduce ? false : { scale: 0.94, rotate: -2 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ duration: 0.5, ease: EASE }}
            className="mx-auto shrink-0 sm:mx-0"
            style={{ perspective: 900 }}
          >
            <Illustration
              name={story.art}
              depth={14}
              className="size-[88px] sm:size-[100px]"
              label={story.title}
            />
          </motion.div>
          <div className="min-w-0 flex-1 text-center sm:text-left">
            <p className="mono-label">{story.label}</p>
            <h3 className="mt-1.5 font-serif text-[clamp(1.35rem,4vw,1.65rem)] leading-[1.12] tracking-[-0.02em] text-balance">
              {story.title}
            </h3>
            <p className="mt-2 text-[14.5px] leading-relaxed text-muted-foreground">{story.body}</p>
          </div>
        </motion.div>
      </AnimatePresence>

      <div className="flex justify-center gap-1.5" role="tablist" aria-label="Étapes du copilote">
        {AI_STORY.map((s, i) => (
          <button
            key={s.id}
            type="button"
            role="tab"
            aria-selected={i === step}
            aria-label={s.title}
            onClick={() => setStep(i)}
            className={cn(
              "h-1.5 rounded-pill transition-all duration-300",
              i === step ? "w-8 bg-ink" : "w-4 bg-line hover:bg-ink/25",
            )}
          />
        ))}
      </div>

      <div
        aria-hidden
        className="pointer-events-none overflow-hidden rounded-[22px] border border-line bg-bg p-1.5 shadow-lift select-none sm:rounded-[28px] sm:p-2"
      >
        <div className="flex min-h-[min(72vh,620px)] overflow-hidden rounded-[18px] bg-bg lg:min-h-[580px] lg:rounded-[22px] lg:p-2">
          <PreviewSidebar activePath={activePath} />

          <div className="relative flex min-w-0 flex-1 flex-col overflow-hidden rounded-[14px] bg-surface lg:rounded-card lg:shadow-soft">
            <PreviewTopbar />
            <div className="relative flex-1 overflow-hidden">
              <AnimatePresence mode="wait">
                <motion.div
                  key={story.scene}
                  className="absolute inset-0 overflow-y-auto overscroll-contain px-4 pt-5 pb-[88px] sm:px-6 sm:pb-6 lg:pb-6"
                  initial={reduce ? { opacity: 0 } : { opacity: 0, y: 12, filter: "blur(4px)" }}
                  animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                  exit={reduce ? { opacity: 0 } : { opacity: 0, y: -8, filter: "blur(4px)" }}
                  transition={{ duration: 0.45, ease: EASE }}
                >
                  {story.scene === "accueil" ? (
                    <PreviewAccueil mode={story.mode} typed={typed} showCopilot={story.mode === "copilot"} />
                  ) : (
                    <PreviewProjets mode={story.mode} />
                  )}
                </motion.div>
              </AnimatePresence>

              {story.mode === "copilot" ? <PreviewCopilot reduce={reduce} /> : null}
            </div>
            <PreviewMobileNav activePath={activePath} copilotGlow={story.mode === "copilot"} />
          </div>
        </div>
      </div>

      {paused ? (
        <p className="text-center text-[12px] text-muted-foreground">Survolé — défilement en pause</p>
      ) : null}
    </div>
  );
}

function PreviewSidebar({ activePath }: { activePath: string }) {
  return (
    <aside className="hidden w-[212px] flex-none flex-col bg-side px-3 pt-5 pb-4 text-side-ink lg:flex lg:w-[252px] lg:px-4">
      <p className="px-3 font-grotesk text-[20px] font-bold tracking-[-0.04em] lg:text-[24px]">
        {BRAND.name}
        <span className="text-side-muted">.</span>
      </p>
      <p className="mono-label mt-6 mb-2 px-3 text-side-muted">{"/ Navigation ///"}</p>
      <nav className="-mx-1 flex-1 overflow-hidden px-1">
        <ul className="flex flex-col gap-0.5">
          {TABS.map(({ href, label, icon: Icon }) => {
            const on = activePath === href || (href !== "/accueil" && activePath.startsWith(href));
            return (
              <li key={href} className="relative">
                {on ? (
                  <span
                    className="absolute inset-0 rounded-xl border border-white/10 bg-gradient-to-r from-white/[.16] via-white/[.07] to-white/0"
                    aria-hidden
                  />
                ) : null}
                <span
                  className={cn(
                    "relative flex min-h-9 items-center gap-2.5 rounded-xl px-3 font-mono text-[10px] font-medium tracking-[0.1em] uppercase lg:min-h-10 lg:text-[11.5px]",
                    on ? "text-side-ink" : "text-side-muted",
                  )}
                >
                  <Icon className="size-3.5 lg:size-4" aria-hidden />
                  {label}
                </span>
              </li>
            );
          })}
        </ul>
      </nav>
      <div className="mt-3 rounded-card border border-side-line bg-white/[.04] p-3">
        <p className="mono-label text-side-muted">/ Copilote ///</p>
        <p className="mt-2 text-[11px] leading-snug text-side-ink/75">
          Contexte : projets, Focus, journal, fichiers.
        </p>
      </div>
    </aside>
  );
}

function PreviewTopbar() {
  return (
    <header className="flex min-h-[52px] shrink-0 items-center gap-2 border-b border-line bg-surface/90 px-3 sm:min-h-15 sm:gap-3 sm:px-5">
      <p className="font-grotesk text-[20px] font-bold tracking-[-0.04em] lg:hidden">
        {BRAND.name}
        <span className="text-accent-2">.</span>
      </p>
      <div className="hidden h-9 max-w-md flex-1 items-center gap-2 rounded-pill border border-line bg-surface-2 px-3 text-[13px] text-muted-foreground sm:flex">
        <Search className="size-3.5" aria-hidden />
        Rechercher…
        <kbd className="ml-auto rounded-md border border-line bg-surface px-1.5 py-0.5 font-mono text-[9px] text-ink/70">
          ⌘K
        </kbd>
      </div>
      <div className="ml-auto flex items-center gap-2">
        <Search className="size-5 text-ink sm:hidden" aria-hidden />
        <span className="hidden rounded-pill border border-line bg-surface-2 px-2.5 py-1 font-mono text-[9px] tracking-[0.12em] text-ink/70 uppercase sm:inline">
          Plan gratuit
        </span>
        <span className="grid size-9 place-items-center rounded-pill bg-ink font-mono text-[13px] font-medium text-accent-ink">
          N
        </span>
      </div>
    </header>
  );
}

function PreviewMobileNav({
  activePath,
  copilotGlow,
}: {
  activePath: string;
  copilotGlow?: boolean;
}) {
  const items = [
    { href: "/accueil", label: "Accueil", icon: House },
    { href: "/projets", label: "Projets", icon: LayoutDashboard },
  ] as const;

  return (
    <nav
      className="relative shrink-0 border-t border-white/10 bg-nav px-2 pt-2 pb-3 lg:hidden"
      aria-hidden
    >
      <div className="relative flex items-center justify-between px-1">
        {items.map(({ href, label, icon: Icon }) => {
          const on = activePath === href;
          return (
            <span
              key={href}
              className={cn(
                "flex min-h-11 flex-1 flex-col items-center justify-center gap-0.5 text-[9px] leading-none",
                on ? "text-white" : "text-white/55",
              )}
            >
              <Icon className="size-5" strokeWidth={1.6} aria-hidden />
              {label}
            </span>
          );
        })}
        <div className="min-w-[52px] flex-1" aria-hidden />
        <span
          className={cn(
            "flex min-h-11 flex-1 flex-col items-center justify-center gap-0.5 text-[9px] leading-none",
            copilotGlow ? "text-white" : "text-white/55",
          )}
        >
          <Bot className="size-5" strokeWidth={1.6} aria-hidden />
          IA
        </span>
        <span className="flex min-h-11 flex-1 flex-col items-center justify-center gap-0.5 text-[9px] text-white/55">
          <LayoutGrid className="size-5" strokeWidth={1.6} aria-hidden />
          Plus
        </span>
      </div>
      <div className="absolute top-[-28px] left-1/2 -translate-x-1/2">
        <span
          className={cn(
            "grid size-[48px] place-items-center rounded-[24px] bg-nav shadow-[0_4px_12px_rgba(0,0,0,0.35)]",
            copilotGlow && "ring-2 ring-white/40",
          )}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/figma/navbar/fab-trait.svg" alt="" width={24} height={18} className="block -scale-y-100" />
        </span>
      </div>
    </nav>
  );
}

function PreviewAccueil({
  mode,
  typed,
  showCopilot,
}: {
  mode: PreviewMode;
  typed: string;
  showCopilot: boolean;
}) {
  return (
    <div className="mx-auto flex max-w-[760px] flex-col gap-6 sm:gap-8">
      <GlowCard tilt={false} className="relative flex flex-col px-4 pt-5 pb-4 sm:px-6 sm:pt-7 sm:pb-5">
        <p className="font-grotesk text-[11px] font-bold tracking-[0.16em] text-ink/75 uppercase">
          Bonjour Noam !
        </p>
        <h2 className="mt-2 max-w-[18ch] font-display text-[clamp(22px,5vw,32px)] leading-[1.06] font-semibold tracking-tightest text-balance">
          Comment puis-je t’aider aujourd’hui ?
        </h2>
        <PreviewPrompt typed={typed} active={mode === "typing" || mode === "context"} />

        <AnimatePresence>
          {mode === "context" ? (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.35, ease: EASE }}
              className="mt-3 flex flex-wrap gap-2"
            >
              {[
                "Studio Devis · Focus",
                "12/18 tâches",
                "Journal : hier",
                "devis-beta.pdf",
              ].map((chip) => (
                <span
                  key={chip}
                  className="rounded-pill bg-ink px-2.5 py-1 font-mono text-[10px] tracking-[0.06em] text-accent-ink uppercase"
                >
                  {chip}
                </span>
              ))}
            </motion.div>
          ) : null}
        </AnimatePresence>

        {showCopilot ? (
          <motion.span
            aria-hidden
            className="pointer-events-none absolute top-4 right-4 hidden rounded-pill bg-ink px-2 py-1 font-mono text-[9px] text-accent-ink lg:inline"
            animate={{ opacity: [0.6, 1, 0.6] }}
            transition={{ duration: 1.2, repeat: Infinity }}
          >
            ⌘J ouvert
          </motion.span>
        ) : null}
      </GlowCard>

      <div className={cn("hidden sm:block", showCopilot && "opacity-40")}>
        <p className="mono-label mb-3">{"/ Actions rapides ///"}</p>
        <ActionCards cards={DEMO_ACTIONS} />
      </div>
    </div>
  );
}

function PreviewPrompt({ typed, active }: { typed: string; active: boolean }) {
  return (
    <div className="mt-4">
      <div
        className={cn(
          "rounded-[20px] border bg-surface p-2 shadow-soft transition-colors duration-300",
          active ? "border-ink/20" : "border-line",
        )}
      >
        <div className="flex items-end gap-2">
          <div className="min-h-[44px] flex-1 rounded-[16px] bg-surface-2 px-3.5 py-2.5 text-[14px] leading-relaxed text-ink">
            {typed}
            {active ? (
              <motion.span
                aria-hidden
                className="ml-0.5 inline-block h-[1.1em] w-0.5 translate-y-0.5 bg-ink"
                animate={{ opacity: [1, 0, 1] }}
                transition={{ duration: 0.9, repeat: Infinity }}
              />
            ) : null}
          </div>
          <span className="btn-dark grid size-10 flex-none place-items-center rounded-pill">
            <ArrowUp className="size-[18px]" aria-hidden />
          </span>
        </div>
      </div>
      <div className="mt-2.5 flex flex-wrap gap-1.5">
        {["Résumer un PDF", "Prochaine action", "Email bêta"].map((t) => (
          <span
            key={t}
            className="rounded-pill bg-surface px-3 py-1.5 text-[12px] text-ink/75 shadow-soft ring-1 ring-line/80"
          >
            {t}
          </span>
        ))}
      </div>
    </div>
  );
}

function PreviewCopilot({ reduce }: { reduce: boolean | null }) {
  const lines = DEMO_REPLY.split("\n").filter(Boolean);

  return (
    <motion.aside
      aria-hidden
      initial={reduce ? { opacity: 0 } : { opacity: 0, x: 24, filter: "blur(6px)" }}
      animate={{ opacity: 1, x: 0, filter: "blur(0px)" }}
      exit={reduce ? { opacity: 0 } : { opacity: 0, x: 16 }}
      transition={{ duration: 0.45, ease: EASE }}
      className="pointer-events-none absolute inset-x-2 bottom-[76px] z-20 flex max-h-[58%] flex-col overflow-hidden rounded-[20px] border border-line bg-bg shadow-lift sm:inset-x-auto sm:right-3 sm:bottom-4 sm:left-auto sm:w-[min(100%,340px)] sm:max-h-[85%] lg:bottom-6"
    >
      <header className="flex items-center justify-between gap-2 border-b border-line px-3 py-2">
        <p className="mono-label text-[10px]">{"/ Assistant IA ///"}</p>
        <Mascot mood="idle" className="size-8" />
      </header>
      <div className="flex flex-1 flex-col gap-2 overflow-y-auto p-3">
        <div className="self-end max-w-[92%] rounded-[14px] bg-surface-2 px-3 py-2 text-[12.5px] leading-snug">
          {DEMO_QUESTION}
        </div>
        <div className="max-w-[95%] rounded-[14px] border border-line bg-surface px-3 py-2.5 text-[12.5px] leading-relaxed">
          {lines.map((line, i) => (
            <motion.p
              key={line}
              initial={reduce ? false : { opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 + i * 0.12, duration: 0.35, ease: EASE }}
              className={cn(line.startsWith("**") && "font-semibold", i > 0 && "mt-1")}
            >
              {line.replace(/\*\*/g, "")}
            </motion.p>
          ))}
        </div>
      </div>
    </motion.aside>
  );
}

function PreviewProjets({ mode }: { mode: PreviewMode }) {
  const highlightFocus = mode === "focus";

  return (
    <section className="mx-auto max-w-[1080px]">
      <PageHead
        art="dashboard-focus"
        label="Projets"
        title="Mes projets"
        tail="un seul en Focus."
      >
        Règle Mon Bureau : un seul projet en Focus tant qu’il n’a pas fait sa première vente.
      </PageHead>
      <div className="grid gap-3.5 sm:grid-cols-[repeat(auto-fill,minmax(280px,1fr))]">
        {DEMO_PROJECTS.map((p, i) => {
          const pulse = (mode === "projects" && i === 0) || (highlightFocus && p.status === "focus");
          return (
            <motion.div
              key={p.id}
              className={cn(
                "relative rounded-card",
                pulse && "ring-2 ring-ink ring-offset-2 ring-offset-surface",
                mode === "focus" && p.status !== "focus" && "opacity-55",
              )}
              animate={pulse && !highlightFocus ? { scale: [1, 1.01, 1] } : undefined}
              transition={{ duration: 1.4, repeat: Infinity, ease: "easeInOut" }}
            >
              {pulse && mode === "projects" ? (
                <span
                  className="absolute -top-2 right-2 z-10 rounded-pill bg-ink px-2 py-0.5 font-mono text-[9px] tracking-wide text-accent-ink uppercase"
                >
                  Prochaine action
                </span>
              ) : null}
              <ProjectCard project={p} index={i} />
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}
