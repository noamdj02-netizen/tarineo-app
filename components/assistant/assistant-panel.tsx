"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { X } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { loadAssistant, type ChatMessage } from "@/app/(app)/assistant/actions";
import type { AssistantFile } from "@/lib/assistant/files";
import { ASSISTANT_EVENT, type AssistantEventDetail } from "@/lib/assistant/open";
import { Chat, type Queued } from "./chat";
import { TarineoCopilotAvatar } from "./copilot-face";
import { CopilotTrigger } from "./copilot-trigger";

const PANEL_EASE = [0.2, 0.8, 0.2, 1] as const;

/**
 * Assistant disponible partout : carte flottante à droite sur ordinateur, feuille qui monte du bas
 * sur mobile. S'ouvre avec ⌘J, le bouton, l'événement `navpit:assistant` ou `?ask=` dans l'URL.
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
  const [data, setData] = useState<{
    history: ChatMessage[];
    presets: string[];
    projectId: string | null;
    role: "general" | "tech" | "produit" | "design" | "launch";
  } | null>(null);
  const [queued, setQueued] = useState<Queued>(null);
  const [preferredProjectId, setPreferredProjectId] = useState<string | null>(null);
  const loading = useRef(false);

  const show = useCallback(
    (question?: string, files?: AssistantFile[], projectId?: string | null) => {
      setOpen(true);
      setPreferredProjectId(projectId ?? null);
      void import("@/lib/analytics/client").then(({ emitEvent }) =>
        emitEvent("copilot_opened", { feature: "copilote", path: pathname }),
      );
      if (question || files?.length) {
        setQueued((q) => ({ id: (q?.id ?? 0) + 1, text: question ?? "", files }));
      }
    },
    [pathname],
  );

  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    loading.current = true;
    loadAssistant({ page: pathname, projectId: preferredProjectId })
      .then((d) => {
        if (!cancelled) setData(d);
      })
      .catch(() => {
        if (!cancelled) setData({ history: [], presets: [], projectId: null, role: "general" });
      })
      .finally(() => {
        loading.current = false;
      });
    return () => {
      cancelled = true;
    };
  }, [open, pathname, preferredProjectId]);

  useEffect(() => {
    if (open) return;
    const t = setTimeout(() => {
      setData(null);
      setPreferredProjectId(null);
    }, 500);
    return () => clearTimeout(t);
  }, [open]);

  useEffect(() => {
    const onOpen = (e: Event) => {
      const d = (e as CustomEvent<AssistantEventDetail>).detail;
      show(d?.question, d?.files, d?.projectId);
    };
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "j") {
        e.preventDefault();
        setOpen((o) => !o);
      } else if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener(ASSISTANT_EVENT, onOpen);
    window.addEventListener("navpit:assistant", onOpen);
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener(ASSISTANT_EVENT, onOpen);
      window.removeEventListener("navpit:assistant", onOpen);
      window.removeEventListener("keydown", onKey);
    };
  }, [show]);

  useEffect(() => {
    const ask = params.get("ask");
    if (!ask) return;
    show(ask === "1" ? undefined : ask);
    const rest = new URLSearchParams(params);
    rest.delete("ask");
    router.replace(rest.size ? `${pathname}?${rest}` : pathname, { scroll: false });
  }, [params, pathname, router, show]);

  const [wide, setWide] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 1024px)");
    const apply = () => setWide(mq.matches);
    apply();
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, []);

  const motionProps = wide
    ? {
        initial: reduce ? { opacity: 0 } : { opacity: 0, y: 12, scale: 0.98 },
        animate: { opacity: 1, y: 0, scale: 1 },
        exit: reduce ? { opacity: 0 } : { opacity: 0, y: 12, scale: 0.98 },
        transition: { duration: reduce ? 0.15 : 0.2, ease: PANEL_EASE },
      }
    : {
        initial: reduce ? { opacity: 0 } : { opacity: 0, y: "100%" },
        animate: { opacity: 1, y: 0 },
        exit: reduce ? { opacity: 0 } : { opacity: 0, y: "100%" },
        transition: { duration: reduce ? 0.15 : 0.22, ease: PANEL_EASE },
      };

  return (
    <>
      <AnimatePresence>
        {!open ? (
          <motion.div
            key="fab"
            {...motionProps}
            className="fixed right-4 z-[45] bottom-[calc(112px+env(safe-area-inset-bottom,0px))] hidden lg:right-6 lg:bottom-6 lg:block"
            data-copilot-fab
          >
            <CopilotTrigger variant="inline" onClick={() => show()} />
          </motion.div>
        ) : null}
      </AnimatePresence>

      <AnimatePresence>
        {open ? (
          <>
            <motion.button
              key="scrim"
              type="button"
              aria-label="Fermer le Copilote"
              onClick={() => setOpen(false)}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2, ease: PANEL_EASE }}
              className="fixed inset-0 z-[54] bg-ink/20 lg:hidden"
            />
            <motion.aside
              key="panel"
              role="dialog"
              aria-modal="true"
              aria-labelledby="copilot-title"
              {...motionProps}
              className="fixed inset-x-0 bottom-0 z-[55] mx-auto flex h-[min(90dvh,760px)] w-full origin-bottom flex-col overflow-hidden rounded-t-[24px] border border-t border-line bg-surface text-ink shadow-[0_8px_28px_rgba(0,0,0,0.08)] lg:inset-x-auto lg:top-4 lg:right-4 lg:bottom-4 lg:mx-0 lg:h-auto lg:w-[392px] lg:max-w-none lg:origin-bottom-right lg:rounded-[18px] dark:border-white/8 dark:bg-[#0F0F0F] dark:shadow-[0_8px_28px_rgba(0,0,0,0.35)]"
              style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
            >
              <div className="mx-auto mt-2 h-1 w-10 flex-none rounded-pill bg-ink/12 lg:hidden" aria-hidden />
              <header className="sticky top-0 z-10 flex h-[60px] shrink-0 items-center justify-between gap-3 border-b border-[rgba(10,10,10,0.08)] bg-inherit px-4 dark:border-white/8">
                <div className="flex min-w-0 items-center gap-2.5">
                  <TarineoCopilotAvatar variant="header" />
                  <div className="min-w-0">
                    <p id="copilot-title" className="text-[14px] font-semibold tracking-[-0.01em]">
                      Assistant TARINEO
                    </p>
                    <p className="flex items-center gap-1.5 text-[11px] text-[#6E6E6E] dark:text-[#A1A1A1]">
                      Que voulez-vous faire ?
                      <span aria-hidden>·</span>
                      <span className="inline-flex items-center gap-1">
                        <span className="size-1.5 rounded-full bg-[#22C55E]" aria-hidden />
                        Prêt
                      </span>
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  aria-label="Fermer le Copilote"
                  className="grid size-8 place-items-center rounded-lg text-[#6E6E6E] transition-colors hover:bg-black/[0.04] hover:text-ink dark:text-[#A1A1A1] dark:hover:bg-white/[0.06]"
                >
                  <X className="size-4" aria-hidden />
                </button>
              </header>
              {data ? (
                <Chat
                  key={`${data.projectId ?? "all"}-${data.role}`}
                  initial={data.history}
                  presets={data.presets}
                  keyMissing={keyMissing}
                  firstName={firstName}
                  queued={queued}
                  projectId={data.projectId}
                  role={data.role}
                />
              ) : (
                <Chat
                  key="boot"
                  initial={[]}
                  presets={[]}
                  keyMissing={keyMissing}
                  firstName={firstName}
                  queued={null}
                  projectId={null}
                  role="general"
                />
              )}
            </motion.aside>
          </>
        ) : null}
      </AnimatePresence>
    </>
  );
}
