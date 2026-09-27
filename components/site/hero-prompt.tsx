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

/** Boîte de prompt du hero : verre sur le film, envoi vers l'inscription. */
export function HeroPrompt({ onFilm = false }: { onFilm?: boolean }) {
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
    <div className={cn("flex w-full flex-col items-center", onFilm ? "gap-0" : "gap-2.5 sm:gap-4")}>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          submit();
        }}
        className={cn(
          "relative flex w-full max-w-[680px] items-center gap-1.5 rounded-[22px] p-1.5 pl-3.5 text-left backdrop-blur-xl transition-shadow duration-500 ease-out-soft",
          onFilm
            ? "border border-accent-ink/20 bg-accent-ink/10 shadow-none focus-within:shadow-[0_0_0_6px_rgba(255,255,255,0.08)]"
            : "items-center gap-2 rounded-[28px] border border-line bg-surface/95 p-2.5 pl-5 shadow-lift focus-within:shadow-[0_0_0_6px_rgba(17,17,17,0.05),var(--shadow-lift)] sm:items-end",
        )}
      >
        <label htmlFor="hero-prompt" className="sr-only">
          Ce que tu veux faire avec Navpit
        </label>
        <div
          className={cn(
            "relative min-w-0 flex-1",
            onFilm ? "min-h-11 py-1.5" : "min-h-11 py-1.5 sm:min-h-[88px] sm:py-0 sm:pt-2",
          )}
        >
          {empty ? (
            <div
              aria-hidden
              className={cn(
                "pointer-events-none absolute inset-x-0 top-1.5 flex min-w-0 items-center overflow-hidden text-[14.5px] leading-6",
                onFilm ? "text-white" : "text-muted-foreground sm:top-2 sm:text-[16.5px] sm:leading-7",
              )}
            >
              <TypingPlaceholder
                examples={EXAMPLES}
                paused={focused}
                onExample={onExample}
                className={onFilm ? "text-white" : undefined}
                onDark={onFilm}
              />
            </div>
          ) : null}
          <textarea
            id="hero-prompt"
            rows={1}
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
              "block h-7 w-full resize-none bg-transparent text-[14.5px] leading-7 outline-none",
              !onFilm && "sm:h-auto sm:min-h-[72px] sm:text-[16.5px] sm:leading-7",
              empty && "caret-transparent",
              onFilm ? "text-white caret-white" : "text-ink",
            )}
          />
        </div>
        <button
          type="submit"
          aria-label="Commencer"
          className={cn(
            "grid size-10 flex-none place-items-center rounded-pill sm:size-11",
            onFilm ? "bg-white text-ink" : "btn-dark",
          )}
        >
          <ArrowUp className="size-[18px]" aria-hidden />
        </button>
      </form>
      <ul
        className={cn(
          "w-full max-w-[680px] gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden",
          onFilm
            ? "hidden"
            : "hidden sm:flex sm:flex-wrap sm:justify-center sm:overflow-visible sm:pb-0",
        )}
        aria-label="Exemples"
      >
        {EXAMPLES.map((s, i) => (
          <li key={s} className="shrink-0 sm:shrink">
            <button
              type="button"
              onClick={() => submit(s)}
              className={cn(
                "min-h-9 max-w-[min(100%,280px)] rounded-pill border px-3 text-left text-[12.5px] backdrop-blur transition-[transform,box-shadow,color] duration-300 ease-out-soft hover:-translate-y-0.5 sm:max-w-none sm:px-3.5 sm:text-[13px]",
                onFilm
                  ? "border-accent-ink/20 bg-ink/25 text-accent-ink/75 hover:text-accent-ink hover:shadow-soft"
                  : "border-line bg-surface/80 text-ink/75 hover:text-ink hover:shadow-soft",
                i === active && (onFilm ? "-translate-y-0.5 text-accent-ink shadow-soft" : "-translate-y-0.5 text-ink shadow-soft"),
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
