"use client";

import { ArrowUp } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useState } from "react";
import { TypingPlaceholder } from "@/components/home/typing-placeholder";
import { cn } from "@/lib/utils";

const EXAMPLES = [
  "Aide-moi à lancer mon SaaS de devis",
  "Rédige le mail à mon premier client",
  "Quelle est ma prochaine action cette semaine ?",
  "Dessine le parcours client de mon app",
];

/** Boîte de prompt du hero : la mascotte écrit les exemples, l'envoi mène à l'inscription. */
export function HeroPrompt() {
  const router = useRouter();
  const [value, setValue] = useState("");
  const [focused, setFocused] = useState(false);
  const [active, setActive] = useState(-1);
  const [last, setLast] = useState<string | null>(null);
  const onExample = useCallback((i: number) => {
    setActive(i);
    if (i >= 0) setLast(EXAMPLES[i]);
  }, []);
  const empty = value.length === 0;

  function submit(text = value) {
    const q = text.trim();
    router.push(q ? `/inscription?q=${encodeURIComponent(q.slice(0, 500))}` : "/inscription");
  }

  return (
    <div className="flex w-full flex-col items-center gap-4">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          submit();
        }}
        className="relative flex w-full max-w-[680px] items-end gap-2 rounded-[28px] border border-line bg-surface/95 p-2.5 pl-5 text-left shadow-lift backdrop-blur-xl transition-shadow duration-500 ease-out-soft focus-within:shadow-[0_0_0_6px_rgba(17,17,17,0.05),var(--shadow-lift)]"
      >
        <label htmlFor="hero-prompt" className="sr-only">
          Ce que tu veux faire avec Navpit
        </label>
        <div className="relative min-h-[88px] min-w-0 flex-1 pt-2">
          {empty ? (
            <div
              aria-hidden
              className="pointer-events-none absolute inset-x-0 top-2 flex items-center text-[16.5px] leading-7 text-muted-foreground"
            >
              <TypingPlaceholder examples={EXAMPLES} paused={focused} onExample={onExample} />
            </div>
          ) : null}
          <textarea
            id="hero-prompt"
            rows={3}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            onKeyDown={(e) => {
              if (e.key === "Tab" && !e.shiftKey && empty && last) {
                e.preventDefault();
                setValue(last);
                return;
              }
              if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {
                e.preventDefault();
                submit();
              }
            }}
            className={cn(
              "block w-full resize-none bg-transparent text-[16.5px] leading-7 text-ink outline-none",
              empty && "caret-transparent",
            )}
          />
        </div>
        <button
          type="submit"
          aria-label="Commencer"
          className="btn-dark grid size-11 flex-none place-items-center rounded-pill"
        >
          <ArrowUp className="size-[18px]" aria-hidden />
        </button>
      </form>
      <ul className="flex flex-wrap justify-center gap-2" aria-label="Exemples">
        {EXAMPLES.map((s, i) => (
          <li key={s}>
            <button
              type="button"
              onClick={() => submit(s)}
              className={cn(
                "min-h-9 rounded-pill border border-line bg-surface/80 px-3.5 text-[13px] text-ink/75 backdrop-blur transition-[transform,box-shadow,color] duration-300 ease-out-soft hover:-translate-y-0.5 hover:text-ink hover:shadow-soft",
                i === active && "-translate-y-0.5 text-ink shadow-soft",
              )}
            >
              {s}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
