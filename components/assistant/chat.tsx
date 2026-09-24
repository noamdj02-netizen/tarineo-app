"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ArrowUp, Square, Trash2 } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useRef, useState, useTransition } from "react";
import { clearChat } from "@/app/(app)/assistant/actions";
import { GlowCard } from "@/components/home/glow-card";
import { Mascot } from "@/components/home/mascot";
import { EASE } from "@/components/motion/reveal";
import { cn } from "@/lib/utils";
import { MessageContent } from "./message-content";
import { ModelSelect, useModel } from "./model-select";

export type ChatMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
};
type Bubble = ChatMessage & { error?: boolean; pending?: boolean };

export function Chat({
  initial,
  presets,
  keyMissing,
  firstName,
}: {
  initial: ChatMessage[];
  presets: string[];
  keyMissing: boolean;
  firstName?: string | null;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const reduce = useReducedMotion();
  const [messages, setMessages] = useState<Bubble[]>(initial);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [focused, setFocused] = useState(false);
  const [model, setModel] = useModel(params.get("model"));
  const abortRef = useRef<AbortController | null>(null);
  const endRef = useRef<HTMLDivElement>(null);
  const autoSent = useRef(false);

  // garde la dernière réponse visible pendant qu'elle s'écrit
  useEffect(() => {
    endRef.current?.scrollIntoView({
      block: "end",
      behavior: reduce ? "auto" : "smooth",
    });
  }, [messages, reduce]);

  const ask = useCallback(
    async (question: string) => {
      const q = question.trim();
      if (!q || busy) return;
      setInput("");
      setBusy(true);
      const userMsg: Bubble = {
        id: crypto.randomUUID(),
        role: "user",
        content: q,
      };
      const replyId = crypto.randomUUID();
      setMessages((m) => [
        ...m,
        userMsg,
        { id: replyId, role: "assistant", content: "", pending: true },
      ]);
      const update = (patch: Partial<Bubble>) =>
        setMessages((m) =>
          m.map((x) => (x.id === replyId ? { ...x, ...patch } : x)),
        );

      const ctl = new AbortController();
      abortRef.current = ctl;
      let text = "";
      try {
        const res = await fetch("/api/assistant", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ question: q, model }),
          signal: ctl.signal,
        });
        if (!res.ok || !res.body) {
          const { error } = await res.json().catch(() => ({ error: null }));
          update({
            content:
              error ?? "Réponse interrompue. Tu peux renvoyer ta question.",
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
              (text ? text + "\n\n" : "") +
              "Réponse interrompue. Tu peux renvoyer ta question.",
            error: true,
            pending: false,
          });
        }
      } finally {
        abortRef.current = null;
        setBusy(false);
        router.refresh(); // met à jour le bloc « Démarrage »
      }
    },
    [busy, model, router],
  );

  // question arrivée depuis l'accueil ou une fiche projet (?q=…)
  useEffect(() => {
    const q = params.get("q");
    if (!q || autoSent.current || keyMissing) return;
    autoSent.current = true;
    router.replace(pathname, { scroll: false });
    void ask(q);
  }, [params, ask, router, pathname, keyMissing]);

  const empty = messages.length === 0;

  return (
    <div className="flex flex-col gap-3">
      {keyMissing ? (
        <p
          role="status"
          className="rounded-card border border-ink/15 bg-accent-soft p-4 text-[14px]"
        >
          <b className="font-semibold">Le copilote n’est pas encore branché.</b>{" "}
          Ajoute ta clé{" "}
          <code className="font-mono text-[12.5px]">ANTHROPIC_API_KEY</code>{" "}
          dans <code className="font-mono text-[12.5px]">.env.local</code>, puis
          relance le serveur.
        </p>
      ) : null}

      <GlowCard
        soft={!empty}
        className="flex min-h-[min(66dvh,600px)] flex-col"
      >
        <div className="flex items-center justify-between gap-2 border-b border-line px-4 py-2.5">
          <p className="mono-label">{"/ Conversation ///"}</p>
          {!empty ? (
            <ClearButton disabled={busy} onCleared={() => setMessages([])} />
          ) : null}
        </div>

        <div
          className="flex flex-1 flex-col gap-3 overflow-y-auto p-4"
          aria-live="polite"
          aria-busy={busy}
        >
          {empty ? (
            <div className="flex flex-col gap-3 px-1 pt-4 sm:px-4 sm:pt-8">
              <p className="font-grotesk text-[13px] font-bold tracking-[0.16em] text-ink/75 uppercase">
                Bonjour{firstName ? ` ${firstName}` : ""} !
              </p>
              <p className="max-w-[15ch] font-display text-[clamp(28px,5.4vw,42px)] leading-[1.05] font-semibold tracking-tightest text-balance">
                Comment puis-je t’aider aujourd’hui ?
              </p>
            </div>
          ) : null}
          <AnimatePresence initial={false}>
            {messages.map((m) => (
              <motion.div
                key={m.id}
                initial={
                  reduce
                    ? { opacity: 0 }
                    : { opacity: 0, y: 10, filter: "blur(4px)" }
                }
                animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                transition={{ duration: 0.4, ease: EASE }}
                className={cn(
                  "max-w-[88%] rounded-2xl px-3.5 py-2.5 text-[14.5px] leading-relaxed break-words",
                  m.role === "user"
                    ? "self-end whitespace-pre-wrap bg-ink text-accent-ink"
                    : m.error
                      ? "self-start border border-destructive/40 bg-surface"
                      : "self-start border border-line bg-surface",
                )}
              >
                {m.role === "user" ? (
                  m.content
                ) : m.pending ? (
                  <span className="inline-flex items-center gap-1.5 text-muted">
                    Réflexion
                    <span className="inline-block size-1.5 animate-pulse rounded-full bg-muted" />
                  </span>
                ) : (
                  <MessageContent text={m.content} />
                )}
              </motion.div>
            ))}
          </AnimatePresence>
          <div ref={endRef} />
        </div>

        <ul
          className="flex gap-2 overflow-x-auto px-4 pb-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          aria-label="Questions toutes prêtes"
        >
          {presets.map((p) => (
            <li key={p} className="flex-none">
              <button
                type="button"
                disabled={busy || keyMissing}
                onClick={() => void ask(p)}
                className="min-h-10 rounded-pill bg-surface px-4 text-[13px] whitespace-nowrap text-ink/80 shadow-soft transition-[transform,box-shadow] duration-300 ease-out-soft hover:-translate-y-0.5 hover:shadow-lift disabled:opacity-50"
              >
                {p}
              </button>
            </li>
          ))}
        </ul>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            void ask(input);
          }}
          className="flex flex-col gap-2 px-3 pb-3"
        >
          <label htmlFor="ask" className="sr-only">
            Ta question
          </label>
          <div className="flex items-end gap-1.5 rounded-[26px] bg-surface p-1.5 shadow-soft transition-shadow duration-500 ease-out-soft focus-within:shadow-lift">
            <Mascot
              mood={busy ? "typing" : input || focused ? "focus" : "idle"}
              className="size-11 flex-none"
            />
            <textarea
              id="ask"
              rows={1}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onFocus={() => setFocused(true)}
              onBlur={() => setFocused(false)}
              onKeyDown={(e) => {
                if (
                  e.key === "Enter" &&
                  !e.shiftKey &&
                  !e.nativeEvent.isComposing
                ) {
                  e.preventDefault();
                  void ask(input);
                }
              }}
              maxLength={4000}
              placeholder="Écris le prompt Cursor pour le hero de mon projet…"
              className="field-sizing-content max-h-36 min-h-11 min-w-0 flex-1 resize-none self-center bg-transparent px-1 py-2.5 text-[15px] outline-none placeholder:text-muted"
            />
            {busy ? (
              <button
                type="button"
                onClick={() => abortRef.current?.abort()}
                aria-label="Arrêter la réponse"
                className="grid size-11 flex-none place-items-center rounded-pill bg-surface-2 hover:bg-accent-soft"
              >
                <Square className="size-4 fill-current" aria-hidden />
              </button>
            ) : (
              <button
                type="submit"
                disabled={!input.trim() || keyMissing}
                aria-label="Envoyer"
                className="btn-dark grid size-11 flex-none place-items-center rounded-pill disabled:translate-y-0 disabled:opacity-35"
              >
                <ArrowUp className="size-[18px]" aria-hidden />
              </button>
            )}
          </div>
          <div className="flex px-1">
            <ModelSelect value={model} onChange={setModel} />
          </div>
        </form>
      </GlowCard>
      <p className="text-[12.5px] text-muted">
        Chaque question utilise ta clé Claude. Le copilote connaît tes projets,
        tes ressources, tes 6 thèmes et la méthode landing.
      </p>
    </div>
  );
}

function ClearButton({
  disabled,
  onCleared,
}: {
  disabled: boolean;
  onCleared: () => void;
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
          const res = await clearChat();
          if (res.ok) onCleared();
          setArmed(false);
        });
      }}
      className={cn(
        "inline-flex min-h-9 items-center gap-1.5 rounded-lg px-2.5 font-mono text-[10.5px] tracking-[0.08em] uppercase transition-colors disabled:opacity-50",
        armed
          ? "bg-destructive text-accent-ink"
          : "text-muted hover:bg-accent-soft hover:text-ink",
      )}
    >
      <Trash2 className="size-3.5" aria-hidden />
      {armed ? "Tout effacer ?" : "Effacer"}
    </button>
  );
}
