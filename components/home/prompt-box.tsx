"use client";

import { useReducedMotion } from "framer-motion";
import { ArrowUp, Mic, MicOff } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { ModelSelect, useModel } from "@/components/assistant/model-select";
import { TypingPlaceholder } from "@/components/home/typing-placeholder";
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

/**
 * Boîte de prompt de l'accueil : suggestions en pastilles, barre en pilule où la mascotte
 * écrit les exemples. Envoie la question au copilote (/assistant).
 */
export function PromptBox({
  suggestions,
  className,
}: {
  suggestions: string[];
  className?: string;
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
  // dernier exemple écrit par la mascotte, repris par Tab une fois le champ focalisé
  const [lastExample, setLastExample] = useState<string | null>(null);
  const onExample = useCallback(
    (i: number) => {
      setActive(i);
      if (i >= 0) setLastExample(suggestions[i] ?? null);
    },
    [suggestions],
  );
  const taRef = useRef<HTMLTextAreaElement>(null);
  const recRef = useRef<SpeechRecognitionLike | null>(null);

  useEffect(() => setCanDictate(getRecognition() !== null), []);

  // la zone de texte grandit avec le contenu
  useEffect(() => {
    const ta = taRef.current;
    if (!ta) return;
    ta.style.height = "auto";
    ta.style.height = `${Math.min(ta.scrollHeight, 180)}px`;
  }, [value]);

  function submit(text = value) {
    const q = text.trim();
    if (!q || sending) return;
    const params = new URLSearchParams({ q, model });
    setSending(true);
    // laisse le temps à la mascotte de lancer son avion
    setTimeout(() => router.push(`/assistant?${params}`), reduce ? 0 : 320);
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
  return (
    <div className={cn("flex flex-col", className)}>
      <ul className="flex flex-wrap gap-2" aria-label="Suggestions">
        {suggestions.map((s, i) => (
          <li key={s}>
            <button
              type="button"
              onClick={() => {
                setValue(s);
                taRef.current?.focus();
              }}
              className={cn(
                "min-h-10 rounded-pill bg-surface px-4 text-[13.5px] text-ink/80 shadow-soft ring-1 ring-transparent transition-[transform,box-shadow,color] duration-300 ease-out-soft hover:-translate-y-0.5 hover:text-ink hover:shadow-lift",
                i === active && "-translate-y-0.5 text-ink shadow-lift ring-ink/10",
              )}
            >
              {s}
            </button>
          </li>
        ))}
      </ul>

      <div className="mt-auto pt-10 sm:pt-12">
        <div className="relative">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              submit();
            }}
            className="relative flex items-end gap-2 rounded-[28px] bg-surface p-2 pl-5 shadow-soft transition-shadow duration-500 ease-out-soft focus-within:shadow-lift"
          >
            <label htmlFor="prompt" className="sr-only">
              Ta question au copilote
            </label>
            <div className="relative min-w-0 flex-1 self-center">
              {empty ? (
                <div
                  aria-hidden
                  className="pointer-events-none absolute inset-0 flex items-center py-2 text-[16px] leading-7 text-muted"
                >
                  <TypingPlaceholder
                    examples={suggestions}
                    paused={focused || listening || sending}
                    onExample={onExample}
                  />
                </div>
              ) : null}
              <textarea
                id="prompt"
                ref={taRef}
                rows={1}
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
                  if (
                    e.key === "Enter" &&
                    !e.shiftKey &&
                    !e.nativeEvent.isComposing
                  ) {
                    e.preventDefault();
                    submit();
                  }
                }}
                className={cn(
                  "block w-full resize-none bg-transparent py-2 text-[16px] leading-7 text-ink outline-none",
                  empty && "caret-transparent",
                )}
              />
            </div>

            {canDictate ? (
              <button
                type="button"
                onClick={toggleDictation}
                aria-pressed={listening}
                aria-label={
                  listening ? "Arrêter la dictée" : "Dicter ma question"
                }
                className={cn(
                  "grid size-11 flex-none place-items-center rounded-pill transition-colors duration-300",
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
              disabled={empty || sending}
              aria-label="Envoyer"
              className="btn-dark grid size-11 flex-none place-items-center rounded-pill disabled:translate-y-0 disabled:opacity-35"
            >
              <ArrowUp className="size-[18px]" aria-hidden />
            </button>
          </form>
        </div>
        <div className="mt-3 flex items-center justify-between gap-3 px-1">
          <ModelSelect value={model} onChange={setModel} />
          <p className="hidden text-[12.5px] text-muted sm:block">
            {empty && lastExample ? "Tab pour reprendre l’exemple" : "Entrée pour envoyer"}
          </p>
        </div>
      </div>
    </div>
  );
}
