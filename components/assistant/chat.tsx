"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ArrowUp, Square, Trash2 } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState, useTransition } from "react";
import { clearChat, type ChatMessage } from "@/app/(app)/assistant/actions";
import { Mascot } from "@/components/home/mascot";
import { EASE } from "@/components/motion/reveal";
import type { AssistantFile } from "@/lib/assistant/files";
import type { AgentRole } from "@/lib/assistant/roles";
import { cn } from "@/lib/utils";
import { MessageContent } from "./message-content";
import { ModelSelect, useModel } from "./model-select";

export type { ChatMessage };
type Bubble = ChatMessage & { error?: boolean; pending?: boolean };

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
  const [focused, setFocused] = useState(false);
  const [model, setModel] = useModel(null);
  const abortRef = useRef<AbortController | null>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const lastQueued = useRef(0);

  useEffect(() => {
    const el = listRef.current;
    if (!el) return;
    el.scrollTo({ top: el.scrollHeight, behavior: reduce ? "auto" : "smooth" });
  }, [messages, reduce]);

  useEffect(() => {
    inputRef.current?.focus({ preventScroll: true });
  }, []);

  const ask = useCallback(
    async (question: string, files?: AssistantFile[]) => {
      const q = question.trim() || (files?.length ? "Lis ce fichier et dis-moi quoi en faire." : "");
      if ((!q && !files?.length) || busy) return;
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
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            question: q,
            model,
            page: pathname,
            files: files ?? [] ,
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
          // la question n'a pas été gardée côté serveur
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
          // arrêt demandé : on garde ce qui est déjà écrit
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
        router.refresh(); // met à jour le bloc « Démarrage » et les données touchées par les outils
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

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div
        ref={listRef}
        className="flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto overscroll-contain px-4 py-4"
        aria-live="polite"
        aria-busy={busy}
      >
        {keyMissing ? (
          <p role="status" className="rounded-card border border-ink/15 bg-accent-soft p-3 text-[13.5px]">
            <b className="font-semibold">Le copilote n’est pas encore branché.</b> Ajoute{" "}
            <code className="font-mono text-[12px]">ANTHROPIC_API_KEY</code> côté serveur.
          </p>
        ) : null}
        {empty ? (
          <div className="flex flex-col gap-2 pt-6">
            <p className="font-grotesk text-[12px] font-bold tracking-[0.16em] text-ink/75 uppercase">
              Bonjour{firstName ? ` ${firstName}` : ""} !
            </p>
            <p className="font-display text-[28px] leading-[1.05] font-semibold tracking-tightest text-balance">
              Comment puis-je t’aider ?
            </p>
            <p className="text-[13.5px] text-muted-foreground">
              Je lis tout le projet et j’agis : mail, tâche, landing, schéma, journal.
            </p>
          </div>
        ) : null}
        <AnimatePresence initial={false}>
          {messages.map((m) => (
            <motion.div
              key={m.id}
              initial={reduce ? { opacity: 0 } : { opacity: 0, y: 10, filter: "blur(4px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              transition={{ duration: 0.4, ease: EASE }}
              className={cn(
                "max-w-[40rem] rounded-2xl px-4 py-3 text-[16.5px] leading-[1.6] break-words",
                m.role === "user"
                  ? "self-end whitespace-pre-wrap bg-ink text-[16px] text-accent-ink"
                  : m.error
                    ? "self-start border border-destructive/40 bg-surface"
                    : "self-start w-full border border-line bg-surface",
              )}
            >
              {m.role === "user" ? (
                m.content
              ) : m.pending ? (
                <span className="inline-flex items-center gap-1.5 text-muted-foreground">
                  Réflexion
                  <span className="inline-block size-1.5 animate-pulse rounded-full bg-muted" />
                </span>
              ) : (
                <MessageContent text={m.content} />
              )}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {empty ? (
        <ul className="flex shrink-0 flex-col gap-1.5 px-4 pb-3" aria-label="Questions toutes prêtes">
          {presets.slice(0, 4).map((p) => (
            <li key={p}>
              <button
                type="button"
                disabled={busy || keyMissing}
                onClick={() => void ask(p)}
                className="w-full rounded-xl border border-line bg-surface px-3.5 py-2.5 text-left text-[13px] text-ink/80 transition-[transform,background-color] duration-300 ease-out-soft hover:-translate-y-px hover:bg-accent-soft disabled:opacity-50"
              >
                {p}
              </button>
            </li>
          ))}
        </ul>
      ) : null}

      <form
        onSubmit={(e) => {
          e.preventDefault();
          void ask(input);
        }}
        className="flex shrink-0 flex-col gap-1.5 border-t border-line px-3 pt-3 pb-3"
      >
        <label htmlFor="ask" className="sr-only">
          Ta question
        </label>
        <div className="flex items-end gap-1.5 rounded-[22px] bg-surface p-1.5 shadow-soft transition-shadow duration-500 ease-out-soft focus-within:shadow-lift">
          <Mascot
            mood={busy ? "typing" : input || focused ? "focus" : "idle"}
            className="size-10 flex-none"
          />
          <textarea
            ref={inputRef}
            id="ask"
            rows={1}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {
                e.preventDefault();
                void ask(input);
              }
            }}
            maxLength={4000}
            placeholder="Rédige un mail à mon client…"
            className="field-sizing-content max-h-36 min-h-10 min-w-0 flex-1 resize-none self-center bg-transparent px-1 py-2 text-[14.5px] outline-none placeholder:text-muted-foreground"
          />
          {busy ? (
            <button
              type="button"
              onClick={() => abortRef.current?.abort()}
              aria-label="Arrêter la réponse"
              className="grid size-10 flex-none place-items-center rounded-pill bg-surface-2 hover:bg-accent-soft"
            >
              <Square className="size-4 fill-current" aria-hidden />
            </button>
          ) : (
            <button
              type="submit"
              disabled={!input.trim() || keyMissing}
              aria-label="Envoyer"
              className="btn-dark grid size-10 flex-none place-items-center rounded-pill disabled:translate-y-0 disabled:opacity-35"
            >
              <ArrowUp className="size-[18px]" aria-hidden />
            </button>
          )}
        </div>
        <div className="flex items-center justify-between gap-2 px-1">
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
      onClick={() => {
        if (!armed) return setArmed(true);
        startTransition(async () => {
          const res = await clearChat({ projectId, role });
          if (res.ok) onCleared();
          setArmed(false);
        });
      }}
      className={cn(
        "inline-flex min-h-9 items-center gap-1.5 rounded-lg px-2.5 font-mono text-[10.5px] tracking-[0.08em] uppercase transition-colors disabled:opacity-50",
        armed ? "bg-destructive text-accent-ink" : "text-muted-foreground hover:bg-accent-soft hover:text-ink",
      )}
    >
      <Trash2 className="size-3.5" aria-hidden />
      {armed ? "Tout effacer ?" : "Effacer"}
    </button>
  );
}
