"use client";

import { ArrowUp, ChevronDown, Mic, MicOff } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { DEFAULT_MODEL, MODELS, type ModelId } from "@/lib/models";
import { cn } from "@/lib/utils";

type SpeechRecognitionLike = {
  lang: string;
  interimResults: boolean;
  continuous: boolean;
  onresult: ((e: { results: ArrayLike<ArrayLike<{ transcript: string }>> }) => void) | null;
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

/** Grande boîte de prompt : envoie la question au copilote (/assistant). */
export function PromptBox({ suggestions }: { suggestions: string[] }) {
  const router = useRouter();
  const [value, setValue] = useState("");
  const [model, setModel] = useState<ModelId>(DEFAULT_MODEL);
  const [listening, setListening] = useState(false);
  const [canDictate, setCanDictate] = useState(false);
  const taRef = useRef<HTMLTextAreaElement>(null);
  const recRef = useRef<SpeechRecognitionLike | null>(null);

  useEffect(() => setCanDictate(getRecognition() !== null), []);

  // la zone de texte grandit avec le contenu
  useEffect(() => {
    const ta = taRef.current;
    if (!ta) return;
    ta.style.height = "auto";
    ta.style.height = `${Math.min(ta.scrollHeight, 240)}px`;
  }, [value]);

  function submit(text = value) {
    const q = text.trim();
    if (!q) return;
    const params = new URLSearchParams({ q, model });
    router.push(`/assistant?${params}`);
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
    <div className="flex flex-col gap-4">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          submit();
        }}
        className="card-soft relative p-4 transition-shadow duration-500 ease-out-soft focus-within:shadow-lift sm:p-5"
      >
        <label htmlFor="prompt" className="sr-only">
          Ta question au copilote
        </label>
        <div className="relative">
          {/* placeholder avec curseur qui clignote */}
          {empty ? (
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0 flex items-start text-[17px] leading-7 text-muted"
            >
              <span className="mt-[5px] mr-1 inline-block h-[18px] w-[2px] animate-[caret-blink_1.1s_steps(1)_infinite] rounded-full bg-ink" />
              Demande à ton copilote…
            </div>
          ) : null}
          <textarea
            id="prompt"
            ref={taRef}
            rows={3}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {
                e.preventDefault();
                submit();
              }
            }}
            className={cn(
              "block min-h-[84px] w-full resize-none bg-transparent text-[17px] leading-7 text-ink outline-none",
              empty && "caret-transparent",
            )}
          />
        </div>

        <div className="mt-3 flex items-center gap-2">
          <div className="relative">
            <select
              value={model}
              onChange={(e) => setModel(e.target.value as ModelId)}
              aria-label="Modèle"
              className="h-10 appearance-none rounded-pill border border-line bg-surface-2 pr-8 pl-3.5 font-mono text-[11px] font-medium tracking-[0.08em] text-ink/80 uppercase outline-none hover:bg-accent-soft"
            >
              {MODELS.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.label} · {m.hint}
                </option>
              ))}
            </select>
            <ChevronDown
              className="pointer-events-none absolute top-1/2 right-2.5 size-3.5 -translate-y-1/2 text-muted"
              aria-hidden
            />
          </div>

          <div className="ml-auto flex items-center gap-2">
            {canDictate ? (
              <button
                type="button"
                onClick={toggleDictation}
                aria-pressed={listening}
                aria-label={listening ? "Arrêter la dictée" : "Dicter ma question"}
                className={cn(
                  "grid size-11 place-items-center rounded-pill border border-line transition-colors duration-300",
                  listening ? "bg-ink text-accent-ink" : "bg-surface text-ink hover:bg-accent-soft",
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
              disabled={empty}
              aria-label="Envoyer"
              className="btn-dark grid size-11 place-items-center rounded-pill disabled:translate-y-0 disabled:opacity-35"
            >
              <ArrowUp className="size-[18px]" aria-hidden />
            </button>
          </div>
        </div>
      </form>

      <ul className="flex flex-wrap justify-center gap-2" aria-label="Suggestions">
        {suggestions.map((s) => (
          <li key={s}>
            <button
              type="button"
              onClick={() => {
                setValue(s);
                taRef.current?.focus();
              }}
              className="min-h-10 rounded-pill border border-line bg-surface px-4 text-[13.5px] text-ink/80 transition-[transform,box-shadow,color] duration-300 ease-out-soft hover:-translate-y-0.5 hover:text-ink hover:shadow-soft"
            >
              {s}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
