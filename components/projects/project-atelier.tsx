import { Check } from "lucide-react";
import Link from "next/link";
import type { JourneyStep } from "@/lib/projects/journey";
import { cn } from "@/lib/utils";

export function ProjectAtelier({ steps }: { steps: JourneyStep[] }) {
  const done = steps.filter((s) => s.done).length;
  return (
    <div className="mb-6">
      <div className="mb-3 flex items-baseline justify-between gap-3">
        <p className="mono-label">{`/ Parcours ///`}</p>
        <p className="font-mono text-[11px] tabular-nums text-muted-foreground">
          {done}/{steps.length}
        </p>
      </div>
      <ol className="grid grid-cols-2 gap-2 sm:grid-cols-5">
        {steps.map((step, i) => (
          <li key={step.id}>
            <Link
              href={step.href}
              prefetch={false}
              className={cn(
                "card-soft flex min-h-[88px] flex-col gap-1.5 p-3 transition-[transform,box-shadow] duration-300 ease-out-soft hover:-translate-y-0.5 hover:shadow-lift",
                step.done && "shadow-[inset_3px_0_0_var(--color-st-focus)]",
              )}
            >
              <span className="flex items-center justify-between gap-2">
                <span className="font-mono text-[10px] tracking-[0.1em] text-muted-foreground">
                  {String(i + 1).padStart(2, "0")}
                </span>
                {step.done ? (
                  <span
                    className="grid size-5 place-items-center rounded-full bg-st-focus text-accent-ink"
                    aria-label="Validé"
                  >
                    <Check className="size-3" strokeWidth={3} aria-hidden />
                  </span>
                ) : (
                  <span className="size-5 rounded-full border border-line" aria-hidden />
                )}
              </span>
              <b className="text-[14px] font-semibold tracking-[-0.02em]">{step.n}</b>
              <small className="text-[12px] leading-snug text-muted-foreground">{step.hint}</small>
            </Link>
          </li>
        ))}
      </ol>
    </div>
  );
}
