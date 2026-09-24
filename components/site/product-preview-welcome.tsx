"use client";

import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { Mascot } from "@/components/mascot";
import { EASE } from "@/components/motion/reveal";
import { landingButtonVariants } from "@/components/site/landing-button";
import { Button } from "@/components/ui/button";
import { brandLogoUrl } from "@/lib/resources/logo";
import { cn } from "@/lib/utils";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

type ProductPreviewWelcomeProps = {
  onStart: () => void;
};

type IntroChatMessage =
  | { type: "user"; text: string }
  | { type: "copilot"; text: string }
  | { type: "action"; title: string; lines: string[]; domain?: string };

/** Scénario démo : le copilote lit le Focus, Figma, puis propose une action. */
const INTRO_SCENARIO: IntroChatMessage[] = [
  { type: "copilot", text: "Salut — Studio Devis est ton Focus en ce moment." },
  { type: "user", text: "Qu’est-ce qui bloque la release de la landing ?" },
  {
    type: "action",
    title: "Contexte projet",
    lines: ["Focus · Studio Devis", "Étape 4 · Checklist landing"],
  },
  {
    type: "action",
    title: "Figma",
    domain: "figma.com",
    lines: ["Page « Landing — Pricing v2 »", "2 frames à valider"],
  },
  {
    type: "copilot",
    text: "Le blocage : section prix + FAQ. Je rédige le mail de relance pour Marcus ?",
  },
  { type: "user", text: "Oui, vas-y." },
  {
    type: "action",
    title: "Prochaine action",
    domain: "notion.so",
    lines: ["Envoyer relance bêta · Studio Devis"],
  },
  {
    type: "copilot",
    text: "Mail prêt dans le copilote — tu valides et on met à jour la tâche.",
  },
];

const TYPING_MS = 650;
const HOLD_MS = 1200;
const USER_PAUSE_MS = 450;
const LOOP_PAUSE_MS = 3600;

function isBotMessage(msg: IntroChatMessage) {
  return msg.type === "copilot" || msg.type === "action";
}

const bubble =
  "rounded-[16px] px-2.5 py-1.5 text-[12.5px] leading-[1.35] shadow-[0_1px_0_rgba(255,255,255,0.65)]";

function TypingIndicator({ align }: { align: "start" | "end" }) {
  return (
    <div
      className={cn(
        "flex w-fit items-center gap-0.5 rounded-[16px] border border-line/70 bg-surface px-2.5 py-1.5",
        align === "end" ? "self-end rounded-br-[5px]" : "self-start rounded-bl-[5px]",
      )}
      aria-hidden
    >
      {[0, 1, 2].map((i) => (
        <motion.span
          key={i}
          className="size-1 rounded-full bg-muted-foreground/65"
          animate={{ opacity: [0.35, 1, 0.35], y: [0, -2, 0] }}
          transition={{ duration: 0.9, repeat: Infinity, delay: i * 0.14, ease: "easeInOut" }}
        />
      ))}
    </div>
  );
}

function ActionCard({ title, lines, domain }: { title: string; lines: string[]; domain?: string }) {
  const logo = domain ? brandLogoUrl(domain, 48) : null;
  const [primary, ...rest] = lines;
  return (
    <motion.div
      initial={{ opacity: 0, y: 6, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.24, ease: EASE }}
      className="flex max-w-[86%] self-start"
    >
      <div className="flex w-full gap-2 rounded-[14px] border border-line/60 bg-surface/95 px-2 py-1.5">
        {logo ? (
          <span className="grid size-7 shrink-0 place-items-center rounded-lg border border-line/80 bg-surface-2">
            <Image src={logo} alt="" width={16} height={16} className="size-4 object-contain" unoptimized />
          </span>
        ) : (
          <span className="grid size-7 shrink-0 place-items-center rounded-lg border border-line/80 bg-surface-2 font-mono text-[9px] font-bold text-muted-foreground">
            ·
          </span>
        )}
        <div className="min-w-0 text-left">
          <p className="font-mono text-[9px] tracking-[0.08em] text-muted-foreground uppercase">{title}</p>
          <p className="text-[12px] leading-snug font-medium text-foreground">{primary}</p>
          {rest.length > 0 ? (
            <p className="text-[11px] leading-snug text-muted-foreground">{rest.join(" · ")}</p>
          ) : null}
        </div>
      </div>
    </motion.div>
  );
}

function CopilotIntroChat() {
  const reduce = useReducedMotion();
  const [visible, setVisible] = useState(reduce ? INTRO_SCENARIO.length : 0);
  const [typing, setTyping] = useState(false);
  const [typingSide, setTypingSide] = useState<"start" | "end">("start");
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollTo({ top: el.scrollHeight, behavior: reduce ? "auto" : "smooth" });
  }, [visible, typing, reduce]);

  useEffect(() => {
    if (reduce) return;

    let cancelled = false;
    const timeouts: ReturnType<typeof setTimeout>[] = [];
    const wait = (ms: number) =>
      new Promise<void>((resolve) => {
        const id = setTimeout(() => resolve(), ms);
        timeouts.push(id);
      });

    const run = async () => {
      while (!cancelled) {
        setVisible(0);
        setTyping(false);
        await wait(500);

        for (let i = 0; i < INTRO_SCENARIO.length; i += 1) {
          if (cancelled) return;
          const next = INTRO_SCENARIO[i];
          const bot = isBotMessage(next);

          if (bot) {
            setTypingSide("start");
            setTyping(true);
            await wait(TYPING_MS);
            if (cancelled) return;
            setTyping(false);
          } else {
            setTypingSide("end");
            setTyping(true);
            await wait(USER_PAUSE_MS);
            if (cancelled) return;
            setTyping(false);
          }

          setVisible(i + 1);
          await wait(bot ? HOLD_MS : 900);
        }

        await wait(LOOP_PAUSE_MS);
      }
    };

    void run();
    return () => {
      cancelled = true;
      timeouts.forEach(clearTimeout);
    };
  }, [reduce]);

  const messages = INTRO_SCENARIO.slice(0, visible);

  return (
    <div
      className="mx-auto w-full max-w-[min(100%,360px)]"
      role="log"
      aria-live="polite"
      aria-label="Exemple : le copilote lit Figma et propose une action sur le projet"
    >
      <div className="overflow-hidden rounded-[18px] border border-line/80 bg-[#e9e9ec] ring-1 ring-line/50">
        <div
          ref={scrollRef}
          className="flex max-h-[min(248px,42vh)] min-h-[168px] flex-col gap-1.5 overflow-y-auto px-2.5 py-3 sm:px-3"
        >
          {messages.map((msg, i) => {
            if (msg.type === "action") {
              return (
                <ActionCard key={`${i}-action`} title={msg.title} lines={msg.lines} domain={msg.domain} />
              );
            }
            if (msg.type === "user") {
              return (
                <motion.div
                  key={`${i}-user`}
                  initial={reduce ? false : { opacity: 0, y: 8, scale: 0.96 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ duration: 0.28, ease: EASE }}
                  className="flex max-w-[84%] self-end"
                >
                  <div className={cn(bubble, "rounded-br-[5px] bg-ink text-accent-ink")}>{msg.text}</div>
                </motion.div>
              );
            }
            return (
              <motion.div
                key={`${i}-copilot`}
                initial={reduce ? false : { opacity: 0, y: 8, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.28, ease: EASE }}
                className="flex max-w-[86%] self-start"
              >
                <div className={cn(bubble, "rounded-bl-[5px] border border-line/50 bg-surface text-foreground")}>
                  {msg.text}
                </div>
              </motion.div>
            );
          })}
          {typing && !reduce ? <TypingIndicator align={typingSide} /> : null}
        </div>
      </div>
    </div>
  );
}

/** Présentation du copilote avant l’aperçu dashboard sur la landing. */
export function ProductPreviewWelcome({ onStart }: ProductPreviewWelcomeProps) {
  const reduce = useReducedMotion();

  return (
    <motion.div
      role="region"
      aria-label="Présentation du copilote Navpit"
      initial={reduce ? { opacity: 0 } : { opacity: 0, y: 12, filter: "blur(4px)" }}
      animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      transition={{ duration: 0.5, ease: EASE }}
    >
      <Card className="gap-0 overflow-hidden rounded-[22px] border-line py-0 shadow-lift ring-1 ring-line sm:rounded-[28px]">
        <CardHeader className="relative gap-3 border-b border-line px-4 pt-6 pb-5 text-center sm:px-10 sm:pt-10 sm:pb-6 sm:pr-[12.5rem]">
          <p className="mono-label">/ Copilote ///</p>
          <CardTitle className="font-display text-[clamp(1.5rem,4.2vw,2rem)] font-semibold tracking-tightest text-balance">
            Salut — je suis ton copilote Navpit.
          </CardTitle>
          <CardDescription className="mx-auto max-w-[52ch] text-[15px] leading-relaxed sm:mx-0 sm:text-left">
            Je connais tes projets, ton <span className="brand-focus">Focus</span> et ton journal. Je lis Figma,
            Notion et tes tâches — puis je te propose la prochaine action, pas un pavé générique.
          </CardDescription>
          <div className="mx-auto mt-1 sm:hidden">
            <Mascot name="07-chat-robot" className="h-24 w-[9.5rem]" label="Copilote Navpit" />
          </div>
          <div className="pointer-events-none absolute top-6 right-6 hidden sm:block" aria-hidden>
            <Mascot
              name="07-chat-robot"
              className="h-[6.75rem] w-[11rem] -translate-y-1"
              label="Copilote Navpit"
            />
          </div>
        </CardHeader>
        <CardContent className="flex justify-center border-b border-line bg-surface-2/50 px-4 py-4 sm:px-6 sm:py-5">
          <CopilotIntroChat />
        </CardContent>
        <CardFooter className="flex flex-col items-stretch justify-center gap-3 px-4 py-6 sm:flex-row sm:items-center sm:px-6 sm:py-8">
          <button
            type="button"
            onClick={onStart}
            className={cn(landingButtonVariants({ variant: "primary", fullWidth: true }), "sm:w-auto sm:min-w-[260px]")}
          >
            <ArrowRight data-icon="inline-start" aria-hidden />
            Voir la démo du cockpit
          </button>
          <Button type="button" variant="ghost" onClick={onStart} className="min-h-10 rounded-pill text-[14px]">
            Passer l’intro
          </Button>
        </CardFooter>
      </Card>
    </motion.div>
  );
}
