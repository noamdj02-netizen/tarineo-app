import { cn } from "@/lib/utils";

export function WizardSteps({
  steps,
  actif,
}: {
  steps: string[];
  actif: number;
}) {
  return (
    <ol className="mb-6 flex items-center gap-0 overflow-x-auto">
      {steps.map((label, i) => {
        const n = i + 1;
        const done = n < actif;
        const current = n === actif;
        return (
          <li key={label} className="flex min-w-0 flex-1 items-center">
            <div className="flex items-center gap-2">
              <span
                className={cn(
                  "flex size-7 shrink-0 items-center justify-center rounded-full text-sm font-medium",
                  current || done ? "bg-primary text-white" : "bg-[#EEF1F3] text-muted-foreground"
                )}
              >
                {n}
              </span>
              <span className={cn("text-sm", current ? "font-medium text-foreground" : "text-muted-foreground")}>{label}</span>
            </div>
            {i < steps.length - 1 && <div className="mx-3 h-px min-w-8 flex-1 bg-[#E6E9EB]" />}
          </li>
        );
      })}
    </ol>
  );
}
