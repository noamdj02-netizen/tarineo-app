import { Mascot } from "@/components/mascot";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { MascotName } from "@/lib/mascots";
import { cn } from "@/lib/utils";

type LandingStepCardProps = {
  step: number;
  title: string;
  description: string;
  mascot: MascotName;
  className?: string;
};

/** Carte étape onboarding — visuel mascotte en bandeau, texte en dessous. */
export function LandingStepCard({ step, title, description, mascot, className }: LandingStepCardProps) {
  const stepLabel = String(step).padStart(2, "0");

  return (
    <Card
      className={cn(
        "group/step h-full gap-0 overflow-hidden rounded-[20px] border-line py-0 shadow-soft ring-1 ring-line sm:rounded-[24px]",
        "transition-[box-shadow,transform] duration-300 ease-out-soft hover:-translate-y-0.5 hover:shadow-lift",
        className,
      )}
    >
      <div className="relative flex min-h-[152px] items-end justify-center overflow-hidden border-b border-line bg-gradient-to-b from-surface-2 via-surface to-surface px-4 pt-7 pb-1 sm:min-h-[168px]">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-[10%] top-[18%] h-[70%] rounded-full bg-[radial-gradient(closest-side,color-mix(in_srgb,var(--color-glow-2)_42%,transparent)_0%,transparent_72%)] opacity-90 blur-2xl"
        />
        <Mascot
          name={mascot}
          label={title}
          className="relative z-[1] h-[6.5rem] w-[10.5rem] transition-transform duration-500 ease-out-soft group-hover/step:scale-[1.03] sm:h-[7.25rem] sm:w-[11.5rem]"
        />
      </div>

      <CardHeader className="gap-3 px-4 pt-5 pb-0 sm:px-6">
        <div className="flex items-center gap-3">
          <span
            className="grid size-10 shrink-0 place-items-center rounded-full border border-line bg-surface-2 font-mono text-[13px] font-semibold tracking-tight text-ink"
            aria-hidden
          >
            {stepLabel}
          </span>
          <p className="font-mono text-[10px] font-medium tracking-[0.16em] text-muted-foreground uppercase">
            Étape {stepLabel}
          </p>
        </div>
        <CardTitle className="text-[1.125rem] font-semibold leading-snug tracking-tight">{title}</CardTitle>
      </CardHeader>

      <CardContent className="px-4 pt-3 pb-5 sm:px-6 sm:pb-6">
        <CardDescription className="text-[14.5px] leading-relaxed">{description}</CardDescription>
      </CardContent>
    </Card>
  );
}
