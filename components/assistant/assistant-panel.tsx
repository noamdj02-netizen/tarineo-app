"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { X } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { loadAssistant, type ChatMessage } from "@/app/(app)/assistant/actions";
import { Mascot } from "@/components/home/mascot";
import { EASE } from "@/components/motion/reveal";
import type { AssistantFile } from "@/lib/assistant/files";
import { ASSISTANT_EVENT, type AssistantEventDetail } from "@/lib/assistant/open";
import { Chat, type Queued } from "./chat";

const SPRING = { type: "spring", stiffness: 420, damping: 40, mass: 0.9 } as const;

/**
 * Assistant disponible partout : carte flottante à droite sur ordinateur, feuille qui monte du bas
 * sur mobile. S'ouvre avec ⌘J, le bouton rond, l'événement `navpit:assistant` ou `?ask=` dans l'URL.
 */
export function AssistantPanel({
  keyMissing,
  firstName,
}: {
  keyMissing: boolean;
  firstName?: string | null;
}) {
  const reduce = useReducedMotion();
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const [open, setOpen] = useState(false);
  const [data, setData] = useState<{ history: ChatMessage[]; presets: string[] } | null>(null);
  const [queued, setQueued] = useState<Queued>(null);
  const loading = useRef(false);

  const show = useCallback((question?: string, files?: AssistantFile[]) => {
    setOpen(true);
    if (question || files?.length) {
      setQueued((q) => ({ id: (q?.id ?? 0) + 1, text: question ?? "", files }));
    }
  }, []);

  useEffect(() => {
    if (!open || data || loading.current) return;
    loading.current = true;
    loadAssistant()
      .then(setData)
      .catch(() => setData({ history: [], presets: [] }))
      .finally(() => (loading.current = false));
  }, [open, data]);

  // à la fermeture, on relira l'historique enregistré (après l'animation de sortie)
  useEffect(() => {
    if (open) return;
    const t = setTimeout(() => setData(null), 500);
    return () => clearTimeout(t);
  }, [open]);

  useEffect(() => {
    const onOpen = (e: Event) => {
      const d = (e as CustomEvent<AssistantEventDetail>).detail;
      show(d?.question, d?.files);
    };
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "j") {
        e.preventDefault();
        setOpen((o) => !o);
      } else if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener(ASSISTANT_EVENT, onOpen);
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener(ASSISTANT_EVENT, onOpen);
      window.removeEventListener("keydown", onKey);
    };
  }, [show]);

  // ?ask=… (après l'inscription, anciens liens /assistant) ; « 1 » ouvre sans question
  useEffect(() => {
    const ask = params.get("ask");
    if (!ask) return;
    show(ask === "1" ? undefined : ask);
    const rest = new URLSearchParams(params);
    rest.delete("ask");
    router.replace(rest.size ? `${pathname}?${rest}` : pathname, { scroll: false });
  }, [params, pathname, router, show]);

  return (
    <>
      <AnimatePresence>
        {!open ? (
          <motion.button
            key="fab"
            type="button"
            onClick={() => show()}
            aria-label="Ouvrir l’assistant (⌘J)"
            initial={{ opacity: 0, scale: 0.8, filter: "blur(4px)" }}
            animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
            exit={{ opacity: 0, scale: 0.8, filter: "blur(4px)" }}
            transition={{ duration: 0.3, ease: EASE }}
            className="group fixed right-6 bottom-6 z-40 hidden items-center gap-2 rounded-pill bg-ink py-1.5 pr-4 pl-1.5 text-[13px] font-medium text-accent-ink shadow-lift transition-transform duration-300 ease-out-soft hover:-translate-y-0.5 lg:inline-flex"
          >
            <span className="grid size-9 place-items-center rounded-pill bg-surface">
              <Mascot mood="idle" className="size-8" />
            </span>
            Assistant
            <kbd className="rounded-md bg-white/15 px-1.5 py-0.5 font-mono text-[10.5px]">⌘J</kbd>
          </motion.button>
        ) : null}
      </AnimatePresence>

      <AnimatePresence>
        {open ? (
          <>
            <motion.button
              key="scrim"
              type="button"
              aria-label="Fermer l’assistant"
              onClick={() => setOpen(false)}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="fixed inset-0 z-50 bg-ink/25 backdrop-blur-[2px] lg:hidden"
            />
            <motion.aside
              key="panel"
              role="dialog"
              aria-label="Assistant IA"
              initial={reduce ? { opacity: 0 } : { opacity: 0, y: 24, scale: 0.98, filter: "blur(6px)" }}
              animate={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
              exit={reduce ? { opacity: 0 } : { opacity: 0, y: 24, scale: 0.98, filter: "blur(6px)" }}
              transition={reduce ? { duration: 0.15 } : SPRING}
              className="fixed inset-x-0 bottom-0 z-50 flex h-[88dvh] origin-bottom flex-col overflow-hidden rounded-t-[28px] bg-bg shadow-lift lg:inset-x-auto lg:top-4 lg:right-4 lg:bottom-4 lg:h-auto lg:w-[400px] lg:origin-bottom-right lg:rounded-card lg:border lg:border-line"
              style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
            >
              <div className="mx-auto mt-2 h-1 w-10 flex-none rounded-pill bg-ink/15 lg:hidden" aria-hidden />
              <header className="flex flex-none items-center justify-between gap-2 border-b border-line px-4 py-2.5">
                <p className="mono-label">{"/ Assistant IA ///"}</p>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  aria-label="Fermer"
                  className="grid size-9 place-items-center rounded-lg text-muted transition-colors hover:bg-accent-soft hover:text-ink"
                >
                  <X className="size-4" aria-hidden />
                </button>
              </header>
              {data ? (
                <Chat
                  initial={data.history}
                  presets={data.presets}
                  keyMissing={keyMissing}
                  firstName={firstName}
                  queued={queued}
                />
              ) : (
                <div className="grid flex-1 place-items-center">
                  <Mascot mood="typing" className="size-14" />
                </div>
              )}
            </motion.aside>
          </>
        ) : null}
      </AnimatePresence>
    </>
  );
}
