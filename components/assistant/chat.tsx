"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ArrowUp, Square, Trash2 } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState, useTransition } from "react";
import { clearChat, type ChatMessage } from "@/app/(app)/assistant/actions";
import type { AssistantFile } from "@/lib/assistant/files";
import type { AgentRole } from "@/lib/assistant/roles";
import { cn } from "@/lib/utils";
import { TarineoCopilotAvatar } from "./copilot-face";
import { ThinkingState, thinkingFromPath } from "./copilot-states";
import { MessageContent } from "./message-content";
import { ModelSelect, useModel } from "./model-select";

export type { ChatMessage };
type Bubble = ChatMessage & { error?: boolean; pending?: boolean };

const ENTER = [0.2, 0.8, 0.2, 1] as const;

const FALLBACK_PRESETS = [
  "Voir mes devis à relancer",
  "Faire le point sur mes chantiers",
  "Analyser mes achats",
  "Voir les hausses fournisseurs",
];

/** Question envoyée depuis ailleurs (barre de l'accueil, fiche projet…) ; `id` change à chaque envoi. */
export type Queued = { id: number; text: string; files?: AssistantFile[] } | null;

export function Chat({
  initial,
  presets,
  keyMissing,
  firstName,
  queued,
  projectId = null,
  role = "general",
}: {
  initial: ChatMessage[];
  presets: string[];
  keyMissing: boolean;
  firstName?: string | null;
  queued: Queued;
  projectId?: string | null;
  role?: AgentRole;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const reduce = useReducedMotion();
  const [messages, setMessages] = useState<Bubble[]>(initial);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [model, setModel] = useModel(null);
  const abortRef = useRef<AbortController | null>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const lastQueued = useRef(0);
  const stickToBottom = useRef(true);
  const thinking = thinkingFromPath(pathname);

  const onScroll = () => {
    const el = listRef.current;
    if (!el) return;
    stickToBottom.current = el.scrollHeight - el.scrollTop - el.clientHeight < 88;
  };

  useEffect(() => {
    const el = listRef.current;
    if (!el || !stickToBottom.current) return;
    el.scrollTo({ top: el.scrollHeight, behavior: reduce ? "auto" : "smooth" });
  }, [messages, reduce]);

  useEffect(() => {
    inputRef.current?.focus({ preventScroll: true });
  }, []);

  const ask = useCallback(
    async (question: string, files?: AssistantFile[]) => {
      const q = question.trim() || (files?.length ? "Lis ce fichier et dis-moi quoi en faire." : "");
      if ((!q && !files?.length) || busy) return;
      stickToBottom.current = true;
      setInput("");
      setBusy(true);
      const shown = files?.length
        ? `${q}\n${files.map((f) => `📎 ${f.name}`).join("\n")}`
        : q;
      const userMsg: Bubble = { id: crypto.randomUUID(), role: "user", content: shown };
      const replyId = crypto.randomUUID();
      setMessages((m) => [
        ...m,
        userMsg,
        { id: replyId, role: "assistant", content: "", pending: true },
      ]);
      const update = (patch: Partial<Bubble>) =>
        setMessages((m) => m.map((x) => (x.id === replyId ? { ...x, ...patch } : x)));

      const ctl = new AbortController();
      abortRef.current = ctl;
      let text = "";
      try {
        const res = await fetch("/api/assistant", {
          method: "POST",
          credentials: "same-origin",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            question: q,
            model,
            page: pathname,
            context: {
              route: pathname,
              entityType: pathname.startsWith("/chantiers/")
                ? "chantier"
                : pathname.startsWith("/pieces/")
                  ? "document"
                  : pathname.startsWith("/relances")
                    ? "relance"
                    : pathname.startsWith("/accueil")
                      ? "dashboard"
                      : undefined,
              entityId: projectId ?? undefined,
            },
            files: files ?? [],
            projectId,
            role,
          }),
          signal: ctl.signal,
        });
        if (!res.ok || !res.body) {
          const { error } = await res.json().catch(() => ({ error: null }));
          update({
            content: error ?? "Réponse interrompue. Tu peux renvoyer ta question.",
            error: true,
            pending: false,
          });
          setMessages((m) => m.filter((x) => x.id !== userMsg.id));
          setInput(q);
          return;
        }
        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        for (;;) {
          const { done, value } = await reader.read();
          if (done) break;
          text += decoder.decode(value, { stream: true });
          update({ content: text, pending: false });
        }
        if (text.includes("⚠️")) update({ error: true });
      } catch {
        if (ctl.signal.aborted) {
          if (!text) setMessages((m) => m.filter((x) => x.id !== replyId));
        } else {
          update({
            content:
              (text ? text + "\n\n" : "") + "Réponse interrompue. Tu peux renvoyer ta question.",
            error: true,
            pending: false,
          });
        }
      } finally {
        abortRef.current = null;
        setBusy(false);
        router.refresh();
      }
    },
    [busy, model, router, pathname, projectId, role],
  );

  useEffect(() => {
    if (!queued || queued.id === lastQueued.current || keyMissing || busy) return;
    lastQueued.current = queued.id;
    if (queued.text || queued.files?.length) void ask(queued.text, queued.files);
  }, [queued, ask, keyMissing, busy]);

  const empty = messages.length === 0;
  const canSend = Boolean(input.trim()) && !keyMissing;
  const quick = (presets.length ? presets : FALLBACK_PRESETS).slice(0, 4);

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div
        ref={listRef}
        onScroll={onScroll}
        className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto overscroll-contain px-4 py-[14px]"
        aria-live="polite"
        aria-busy={busy}
      >
        {keyMissing ? (
          <p role="status" className="rounded-[12px] border border-line bg-surface-2 p-3 text-[13px]">
            <b className="font-semibold">Le copilote n’est pas encore branché.</b> Ajoute{" "}
            <code className="font-mono text-[12px]">ANTHROPIC_API_KEY</code> côté serveur.
          </p>
        ) : null}
        {empty ? (
          <div className="flex flex-col gap-5 pt-2">
            <div>
              <p className="text-[14px] leading-snug text-ink">
                Bonjour{firstName ? ` ${firstName}` : ""}.
              </p>
              <p className="mt-0.5 text-[14px] text-[#6E6E6E] dark:text-[#A1A1A1]">
                Que voulez-vous faire ?
              </p>
            </div>
            <ul className="flex flex-col gap-1.5" aria-label="Actions rapides">
              {quick.map((p) => (
                <li key={p}>
                  <button
                    type="button"
                    disabled={busy || keyMissing}
                    onClick={() => void ask(p)}
                    aria-label={p}
                    className="flex w-full items-center justify-between gap-2 rounded-[12px] border border-[rgba(10,10,10,0.08)] bg-transparent px-3 py-2 text-left text-[13px] text-ink transition-colors duration-150 hover:border-[#FF6B1A]/25 hover:bg-[rgba(255,107,26,0.06)] hover:text-[#FF6B1A] disabled:opacity-50 dark:border-white/8"
                  >
                    <span>{p}</span>
                    <span aria-hidden>→</span>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        ) : null}
        <AnimatePresence initial={false}>
          {messages.map((m) => (
            <motion.div
              key={m.id}
              initial={reduce ? { opacity: 0 } : { opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2, ease: ENTER }}
              className={cn(
                "max-w-[40rem] text-[14px] leading-[1.55] break-words",
                m.role === "user" ? "self-end" : "self-start w-full",
              )}
            >
              {m.role === "user" ? (
                <div className="rounded-[12px] border border-line bg-surface-2 px-3 py-2 whitespace-pre-wrap">
                  {m.content}
                </div>
              ) : (
                <div className="flex items-start gap-2.5">
                  <TarineoCopilotAvatar variant="message" className="translate-y-px" />
                  <div className="min-w-0 flex-1 pt-px">
                    {m.pending ? (
                      <ThinkingState title={thinking.title} detail={thinking.detail} />
                    ) : m.error ? (
                      <div className="flex flex-col gap-1.5">
                        <p className="text-[13px] text-destructive">{m.content}</p>
                        <button
                          type="button"
                          onClick={() => {
                            const lastUser = [...messages].reverse().find((x) => x.role === "user");
                            if (lastUser) void ask(lastUser.content);
                          }}
                          className="self-start text-[12px] font-medium text-[#FF6B1A] hover:underline"
                          aria-label="Réessayer"
                        >
                          Réessayer
                        </button>
                      </div>
                    ) : (
                      <MessageContent text={m.content} streaming={busy && m === messages.at(-1)} />
                    )}
                  </div>
                </div>
              )}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          void ask(input);
        }}
        className="sticky bottom-0 flex shrink-0 flex-col gap-1.5 border-t border-[rgba(10,10,10,0.08)] bg-inherit px-3 pt-2.5 pb-3 dark:border-white/8"
      >
        <label htmlFor="ask" className="sr-only">
          Votre demande
        </label>
        <div
          className={cn(
            "flex items-end gap-1.5 rounded-[14px] border bg-transparent p-1.5 transition-[border-color,box-shadow] duration-150",
            "border-[rgba(10,10,10,0.08)] dark:border-white/8",
            "focus-within:border-[#FF6B1A] focus-within:shadow-[0_0_0_3px_rgba(255,107,26,0.10)]",
          )}
        >
          <textarea
            ref={inputRef}
            id="ask"
            rows={1}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {
                e.preventDefault();
                void ask(input);
              }
            }}
            maxLength={4000}
            placeholder="Rédigez votre demande…"
            className="field-sizing-content max-h-36 min-h-9 min-w-0 flex-1 resize-none self-center bg-transparent px-2.5 py-1.5 text-[14px] text-ink outline-none placeholder:text-[#6E6E6E] dark:placeholder:text-[#A1A1A1]"
          />
          {busy ? (
            <button
              type="button"
              onClick={() => abortRef.current?.abort()}
              aria-label="Arrêter la réponse"
              className="grid size-9 flex-none place-items-center rounded-full bg-surface-2 text-ink hover:bg-muted"
            >
              <Square className="size-3.5 fill-current" aria-hidden />
            </button>
          ) : (
            <button
              type="submit"
              disabled={!canSend}
              aria-label="Envoyer"
              className={cn(
                "grid size-9 flex-none place-items-center rounded-full text-white transition-[background-color,filter] duration-150",
                canSend
                  ? "bg-[#FF6B1A] hover:brightness-[0.96]"
                  : "bg-[#D4D4D4] dark:bg-[#2A2A2A]",
              )}
            >
              <ArrowUp className="size-4" aria-hidden />
            </button>
          )}
        </div>
        <div className="flex items-center justify-between gap-2 px-0.5">
          <ModelSelect value={model} onChange={setModel} />
          {!empty ? (
            <ClearButton
              disabled={busy}
              projectId={projectId}
              role={role}
              onCleared={() => setMessages([])}
            />
          ) : null}
        </div>
      </form>
    </div>
  );
}

function ClearButton({
  disabled,
  onCleared,
  projectId,
  role,
}: {
  disabled: boolean;
  onCleared: () => void;
  projectId: string | null;
  role: AgentRole;
}) {
  const [armed, setArmed] = useState(false);
  const [pending, startTransition] = useTransition();
  useEffect(() => {
    if (!armed) return;
    const t = setTimeout(() => setArmed(false), 3000);
    return () => clearTimeout(t);
  }, [armed]);
  return (
    <button
      type="button"
      disabled={disabled || pending}
      aria-label={armed ? "Confirmer l’effacement" : "Effacer la conversation"}
      onClick={() => {
        if (!armed) return setArmed(true);
        startTransition(async () => {
          const res = await clearChat({ projectId, role });
          if (res.ok) onCleared();
          setArmed(false);
        });
      }}
      className={cn(
        "inline-flex min-h-7 items-center gap-1 rounded-md px-1.5 text-[11px] transition-colors disabled:opacity-50",
        armed ? "text-destructive" : "text-[#6E6E6E] hover:text-ink dark:text-[#A1A1A1]",
      )}
    >
      <Trash2 className="size-3" aria-hidden />
      {armed ? "Tout effacer ?" : "Effacer"}
    </button>
  );
}
