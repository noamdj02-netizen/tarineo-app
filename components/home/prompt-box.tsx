"use client";

import { useReducedMotion } from "framer-motion";
import { ArrowUp, Mic, MicOff, Paperclip, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { ModelSelect, useModel } from "@/components/assistant/model-select";
import { TypingPlaceholder } from "@/components/home/typing-placeholder";
import {
  acceptFile,
  MAX_FILES,
  readAsAssistantFile,
  type AssistantFile,
} from "@/lib/assistant/files";
import { stashCopilotDraft } from "@/lib/assistant/copilot-draft.client";
import { Mascot } from "@/components/home/mascot";
import { AutomationChips } from "@/components/home/automation-chips";
import { AUTOMATIONS, type Automation } from "@/lib/home/automations";
import { cn } from "@/lib/utils";

type SpeechRecognitionLike = {
  lang: string;
  interimResults: boolean;
  continuous: boolean;
  onresult:
    | ((e: { results: ArrayLike<ArrayLike<{ transcript: string }>> }) => void)
    | null;
  onend: (() => void) | null;
  onerror: (() => void) | null;
  start: () => void;
  stop: () => void;
};

function getRecognition(): SpeechRecognitionLike | null {
  if (typeof window === "undefined") return null;
  const w = window as unknown as {
    SpeechRecognition?: new () => SpeechRecognitionLike;
    webkitSpeechRecognition?: new () => SpeechRecognitionLike;
  };
  const Ctor = w.SpeechRecognition ?? w.webkitSpeechRecognition;
  return Ctor ? new Ctor() : null;
}

const PLACEHOLDERS = AUTOMATIONS.map((a) => a.hint);

/**
 * Barre de l'accueil : dépôt de fichiers, exemples d'automatisations, mascotte qui écrit.
 * Envoie vers la page Copilote avec la question et les pièces jointes.
 */
export function PromptBox({
  className,
  band,
  large,
}: {
  className?: string;
  /** Bandeau dashboard : sans puces auto. */
  band?: boolean;
  /** Zone de saisie plus haute (dashboard featured). */
  large?: boolean;
}) {
  const router = useRouter();
  const reduce = useReducedMotion();
  const [value, setValue] = useState("");
  const [model, setModel] = useModel();
  const [listening, setListening] = useState(false);
  const [canDictate, setCanDictate] = useState(false);
  const [focused, setFocused] = useState(false);
  const [sending, setSending] = useState(false);
  const [active, setActive] = useState(-1);
  const [lastExample, setLastExample] = useState<string | null>(null);
  const [files, setFiles] = useState<AssistantFile[]>([]);
  const [dragOver, setDragOver] = useState(false);
  const [fileError, setFileError] = useState<string | null>(null);
  const onExample = useCallback((i: number) => {
    setActive(i);
    if (i >= 0) setLastExample(AUTOMATIONS[i]?.prompt ?? null);
  }, []);
  const taRef = useRef<HTMLTextAreaElement>(null);
  const recRef = useRef<SpeechRecognitionLike | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => setCanDictate(getRecognition() !== null), []);

  useEffect(() => {
    const ta = taRef.current;
    if (!ta) return;
    ta.style.height = "auto";
    const max = large ? 220 : 180;
    ta.style.height = `${Math.min(ta.scrollHeight, max)}px`;
  }, [value, large]);

  const addFiles = useCallback(async (list: FileList | File[]) => {
    setFileError(null);
    const incoming = Array.from(list);
    const next: AssistantFile[] = [];
    for (const f of incoming) {
      const err = acceptFile(f);
      if (err) {
        setFileError(err);
        continue;
      }
      next.push(await readAsAssistantFile(f));
    }
    setFiles((prev) => [...prev, ...next].slice(0, MAX_FILES));
  }, []);

  function submit(text = value) {
    const q = text.trim() || (files.length ? "Lis ce fichier et dis-moi quoi en faire." : "");
    if ((!q && !files.length) || sending) return;
    setSending(true);
    const attached = files;
    setTimeout(() => {
      stashCopilotDraft({
        question: q,
        files: attached.length ? attached : undefined,
      });
      const sp = new URLSearchParams({ send: "1" });
      if (!attached.length && q) sp.set("q", q.slice(0, 500));
      router.push(`/copilote?${sp}`);
      setValue("");
      setFiles([]);
      setSending(false);
    }, reduce ? 0 : 280);
  }

  function toggleDictation() {
    if (listening) {
      recRef.current?.stop();
      return;
    }
    const rec = getRecognition();
    if (!rec) return;
    rec.lang = "fr-FR";
    rec.interimResults = true;
    rec.continuous = false;
    const base = value ? value.trimEnd() + " " : "";
    rec.onresult = (e) => {
      const said = Array.from(e.results)
        .map((r) => r[0].transcript)
        .join("");
      setValue(base + said);
    };
    rec.onend = () => setListening(false);
    rec.onerror = () => setListening(false);
    recRef.current = rec;
    setListening(true);
    rec.start();
  }

  const empty = value.length === 0;
  const canSend = !sending && (!empty || files.length > 0);

  return (
    <div className={cn("flex flex-col", className)}>
      <div className={band ? undefined : "mt-auto"}>
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragOver(false);
            if (e.dataTransfer.files.length) void addFiles(e.dataTransfer.files);
          }}
          className="relative"
        >
          <form
            onSubmit={(e) => {
              e.preventDefault();
              submit();
            }}
            className={cn(
              "relative flex flex-col gap-2 rounded-[28px] bg-surface shadow-soft transition-[box-shadow,outline-color] duration-500 ease-out-soft focus-within:shadow-lift",
              large ? "p-3 pl-5 sm:p-3.5 sm:pl-6" : "p-2 pl-4",
              dragOver && "ring-2 ring-ink/20",
            )}
          >
            {dragOver ? (
              <p className="pointer-events-none absolute inset-0 z-10 grid place-items-center rounded-[28px] bg-surface/90 text-[14px] font-medium">
                Dépose tes fichiers ici
              </p>
            ) : null}

            {files.length ? (
              <ul className="flex flex-wrap gap-1.5 pt-1 pr-2" aria-label="Fichiers joints">
                {files.map((f, i) => (
                  <li
                    key={`${f.name}-${i}`}
                    className="inline-flex max-w-full items-center gap-1.5 rounded-pill bg-surface-2 py-1 pr-1 pl-2.5 text-[12.5px]"
                  >
                    <span className="truncate">{f.name}</span>
                    <button
                      type="button"
                      aria-label={`Retirer ${f.name}`}
                      onClick={() => setFiles((xs) => xs.filter((_, j) => j !== i))}
                      className="grid size-6 place-items-center rounded-pill hover:bg-accent-soft"
                    >
                      <X className="size-3" aria-hidden />
                    </button>
                  </li>
                ))}
              </ul>
            ) : null}

            <div className={cn("flex items-end gap-2", large && "gap-2.5")}>
              <label htmlFor="prompt" className="sr-only">
                Ta question au copilote
              </label>
              <div
                className={cn(
                  "relative min-w-0 flex-1 self-center",
                  large && "min-h-[4.5rem] sm:min-h-[5rem]",
                )}
              >
                {empty ? (
                  <div
                    aria-hidden
                    className={cn(
                      "pointer-events-none absolute inset-0 flex items-center py-2 text-muted-foreground",
                      large ? "text-[17px] leading-8 sm:text-[18px]" : "text-[16px] leading-7",
                    )}
                  >
                    <TypingPlaceholder
                      examples={[...PLACEHOLDERS]}
                      paused={focused || listening || sending}
                      onExample={onExample}
                    />
                  </div>
                ) : null}
                <textarea
                  id="prompt"
                  ref={taRef}
                  rows={large ? 2 : 1}
                  value={value}
                  onChange={(e) => setValue(e.target.value)}
                  onFocus={() => setFocused(true)}
                  onBlur={() => setFocused(false)}
                  onKeyDown={(e) => {
                    if (e.key === "Tab" && !e.shiftKey && empty && lastExample) {
                      e.preventDefault();
                      setValue(lastExample);
                      return;
                    }
                    if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {
                      e.preventDefault();
                      submit();
                    }
                  }}
                  className={cn(
                    "block w-full resize-none bg-transparent py-2 text-ink outline-none",
                    large ? "text-[17px] leading-8 sm:text-[18px] sm:leading-8" : "text-[16px] leading-7",
                    empty && "caret-transparent",
                  )}
                />
              </div>

              <input
                ref={fileRef}
                type="file"
                multiple
                accept="image/*,.pdf,.txt,.md,.csv,.json"
                className="sr-only"
                onChange={(e) => {
                  if (e.target.files?.length) void addFiles(e.target.files);
                  e.target.value = "";
                }}
              />
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                aria-label="Joindre un fichier"
                className={cn(
                  "grid flex-none place-items-center rounded-pill bg-surface-2 text-ink hover:bg-accent-soft",
                  large ? "size-12" : "size-11",
                )}
              >
                <Paperclip className={large ? "size-5" : "size-[18px]"} aria-hidden />
              </button>
              {canDictate ? (
                <button
                  type="button"
                  onClick={toggleDictation}
                  aria-pressed={listening}
                  aria-label={listening ? "Arrêter la dictée" : "Dicter ma question"}
                  className={cn(
                    "grid flex-none place-items-center rounded-pill transition-colors duration-300",
                    large ? "size-12" : "size-11",
                    listening
                      ? "bg-ink text-accent-ink"
                      : "bg-surface-2 text-ink hover:bg-accent-soft",
                  )}
                >
                  {listening ? (
                    <MicOff className="size-[18px]" aria-hidden />
                  ) : (
                    <Mic className="size-[18px]" aria-hidden />
                  )}
                </button>
              ) : null}
              <button
                type="submit"
                disabled={!canSend}
                aria-label="Envoyer"
                className={cn(
                  "btn-dark grid flex-none place-items-center rounded-pill disabled:translate-y-0 disabled:opacity-35",
                  large ? "size-12" : "size-11",
                )}
              >
                {sending ? (
                  <Mascot mood="typing" className="size-8" />
                ) : (
                  <ArrowUp className="size-[18px]" aria-hidden />
                )}
              </button>
            </div>
          </form>
        </div>

        {fileError ? (
          <p role="alert" className="mt-2 px-1 text-[12.5px] text-st-fini-ink">
            {fileError}
          </p>
        ) : null}

        {large || !band ? (
          <AutomationChips
            className={cn(large ? "mt-3" : "mt-3")}
            activeIndex={active}
            showMoreLink={large}
            onPick={(a: Automation) => {
              if (large) {
                submit(a.prompt);
                return;
              }
              setValue(a.prompt);
              taRef.current?.focus();
            }}
          />
        ) : null}

        <div className={cn("flex items-center justify-between gap-3 px-1", large || !band ? "mt-3" : "mt-2")}>
          <ModelSelect value={model} onChange={setModel} />
          <p className="hidden text-[12px] text-muted-foreground sm:block">
            {band ? "Entrée pour envoyer" : "Dépose un fichier · Entrée pour envoyer"}
          </p>
        </div>
      </div>
    </div>
  );
}
