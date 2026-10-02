"use client";

import { cn } from "@/lib/utils";

const ARROW =
  "grid size-9 place-items-center rounded-full text-ink/35 transition-colors duration-300 hover:bg-ink/[0.04] hover:text-ink/65 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-tarineo-orange-ring";

const FLOW_LABELS = ["Devis fournisseur", "Analyse TARINEO", "Devis client"] as const;

type HeroFlowControlsProps = {
  focus: 0 | 1 | 2;
  onSelect: (focus: 0 | 1 | 2) => void;
  onPrev: () => void;
  onNext: () => void;
  caption?: string;
  className?: string;
};

/** Timeline éditoriale : ← 1 — 2 — 3 → + libellé discret. */
export function HeroFlowControls({
  focus,
  onSelect,
  onPrev,
  onNext,
  caption = "Analyser un devis",
  className,
}: HeroFlowControlsProps) {
  return (
    <div className={cn("flex flex-col items-center gap-2", className)}>
      <div className="flex items-center gap-1 sm:gap-1.5">
        <button type="button" onClick={onPrev} className={ARROW} aria-label="Étape précédente">
          <span className="font-display text-[15px] leading-none" aria-hidden>←</span>
        </button>

        <ol className="flex items-center">
          {FLOW_LABELS.map((name, i) => (
            <li key={name} className="flex items-center">
              <button
                type="button"
                onClick={() => onSelect(i as 0 | 1 | 2)}
                aria-current={i === focus ? "step" : undefined}
                aria-label={`Étape ${i + 1} : ${name}`}
                className={cn(
                  "min-w-[1.75rem] px-1.5 py-1 font-display text-[13px] tabular-nums transition-colors duration-300 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-tarineo-orange-ring",
                  i === focus
                    ? "font-semibold text-ink"
                    : "font-medium text-ink/32 hover:text-ink/55",
                )}
              >
                {i + 1}
              </button>
              {i < FLOW_LABELS.length - 1 ? (
                <span className="px-0.5 text-[12px] text-ink/22" aria-hidden>—</span>
              ) : null}
            </li>
          ))}
        </ol>

        <button type="button" onClick={onNext} className={ARROW} aria-label="Étape suivante">
          <span className="font-display text-[15px] leading-none" aria-hidden>→</span>
        </button>
      </div>
      <p className="text-[12.5px] font-medium tracking-[-0.01em] text-landing-ink-muted">{caption}</p>
    </div>
  );
}
