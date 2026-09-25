import { cn } from "@/lib/utils";

export function WizardSteps({
  steps,
  actif,
  onSelect,
  etapeMaxAtteinte,
}: {
  steps: string[];
  actif: number;
  /** Rend les étapes déjà atteintes cliquables (retour arrière rapide). */
  onSelect?: (etape: number) => void;
  /** Étape la plus avancée déjà visitée — au-delà, le clic reste bloqué. */
  etapeMaxAtteinte?: number;
}) {
  const maxCliquable = etapeMaxAtteinte ?? actif;

  return (
    <ol className="mb-6 flex items-center gap-0 overflow-x-auto">
      {steps.map((label, i) => {
        const n = i + 1;
        const done = n < actif;
        const current = n === actif;
        const cliquable = Boolean(onSelect) && n <= maxCliquable && !current;

        const contenu = (
          <div className="flex items-center gap-2">
            <span
              className={cn(
                "flex size-7 shrink-0 items-center justify-center rounded-full text-sm font-medium transition-colors duration-300",
                current || done ? "bg-primary text-white" : "bg-[#EEF1F3] text-muted-foreground"
              )}
            >
              {done ? "✓" : n}
            </span>
            <span
              className={cn(
                "hidden whitespace-nowrap text-sm transition-colors duration-300 sm:inline",
                current ? "font-medium text-foreground" : "text-muted-foreground"
              )}
            >
              {label}
            </span>
          </div>
        );

        return (
          <li key={label} className="flex min-w-0 flex-1 items-center">
            {cliquable ? (
              <button
                type="button"
                onClick={() => onSelect?.(n)}
                className="rounded-full transition-opacity hover:opacity-70"
                aria-label={`Revenir à l'étape ${n} : ${label}`}
              >
                {contenu}
              </button>
            ) : (
              contenu
            )}
            {i < steps.length - 1 && (
              <div className="mx-3 h-px min-w-8 flex-1 overflow-hidden bg-[#E6E9EB]">
                <div
                  className="h-full bg-primary transition-[width] duration-500 ease-out"
                  style={{ width: done ? "100%" : "0%" }}
                />
              </div>
            )}
          </li>
        );
      })}
    </ol>
  );
}
