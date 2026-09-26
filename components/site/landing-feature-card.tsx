import { Mascot } from "@/components/mascot";
import { Illustration } from "@/components/illustration";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { IllustrationName } from "@/lib/illustrations";
import type { MascotName } from "@/lib/mascots";
import { cn } from "@/lib/utils";

export type FeatureGlowTint = "glow-1" | "glow-2" | "glow-3";

export const GLOW_HALO: Record<FeatureGlowTint, string> = {
  "glow-1":
    "bg-[radial-gradient(closest-side,color-mix(in_srgb,var(--color-glow-1)_44%,transparent)_0%,transparent_72%)]",
  "glow-2":
    "bg-[radial-gradient(closest-side,color-mix(in_srgb,var(--color-glow-2)_44%,transparent)_0%,transparent_72%)]",
  "glow-3":
    "bg-[radial-gradient(closest-side,color-mix(in_srgb,var(--color-glow-3)_44%,transparent)_0%,transparent_72%)]",
};

type LandingFeatureCardProps = {
  title: string;
  description: string;
  step?: string;
  kicker?: string;
  className?: string;
  mascot?: MascotName;
  art?: IllustrationName;
  /** Halo coloré derrière la mascotte (grille fonctions). */
  glow?: FeatureGlowTint;
};

/** Carte fonction — bandeau visuel + texte (carousel ou grille landing). */
export function LandingFeatureCard({
  art,
  mascot,
  title,
  description,
  step,
  kicker,
  className,
  glow = "glow-2",
}: LandingFeatureCardProps) {
  const hasVisual = Boolean(mascot || art);

  return (
    <Card
      className={cn(
        "group/feature h-full gap-0 overflow-hidden rounded-[20px] border-line py-0 shadow-soft ring-1 ring-line sm:rounded-[24px]",
        "transition-[box-shadow,transform] duration-300 ease-out-soft hover:-translate-y-0.5 hover:shadow-lift",
        className,
      )}
    >
      {hasVisual ? (
        <div
          className={cn(
            "relative flex min-h-[132px] items-end justify-center overflow-hidden border-b border-line",
            "bg-gradient-to-b from-surface-2 via-surface to-surface px-3 pt-6 pb-0 sm:min-h-[148px] sm:px-4 sm:pt-7",
          )}
        >
          <div
            aria-hidden
            className={cn(
              "pointer-events-none absolute inset-x-[8%] top-[12%] h-[78%] rounded-full opacity-90 blur-2xl",
              GLOW_HALO[glow],
            )}
          />
          {mascot ? (
            <Mascot
              name={mascot}
              label={title}
              className="relative z-[1] h-[5.75rem] w-[9.25rem] transition-transform duration-500 ease-out-soft group-hover/feature:scale-[1.03] sm:h-[6.5rem] sm:w-[10.5rem]"
            />
          ) : art ? (
            <Illustration
              name={art}
              label={title}
              depth={5}
              className="relative z-[1] size-[88px] sm:size-[96px]"
            />
          ) : null}
        </div>
      ) : null}

      <CardHeader className="gap-2 px-4 pt-5 pb-0 sm:px-6">
        {kicker ? <p className="mono-label">{`/ ${kicker} ///`}</p> : null}
        {step && !kicker ? (
          <p className="font-mono text-[11px] font-medium tracking-[0.14em] text-muted-foreground uppercase">
            Étape {step}
          </p>
        ) : null}
        <CardTitle className="text-[1.0625rem] font-semibold leading-snug tracking-tight sm:text-[1.125rem]">
          {title}
        </CardTitle>
      </CardHeader>

      <CardContent className="px-4 pt-3 pb-5 sm:px-6 sm:pb-6">
        <CardDescription className="text-[14.5px] leading-relaxed">{description}</CardDescription>
      </CardContent>
    </Card>
  );
}
