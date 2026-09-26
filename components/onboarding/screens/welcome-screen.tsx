import { Illustration } from "@/components/illustration";
import { Button } from "@/components/ui/button";

export function WelcomeScreen({ onStart }: { onStart: () => void }) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center text-center">
      <Illustration
        name="onboarding-bienvenue"
        className="mb-4 size-32 sm:mb-6 sm:size-52"
      />
      <h1 className="max-w-[20ch] font-serif text-[clamp(1.65rem,7.2vw,2.5rem)] leading-[1.08] tracking-[-0.03em]">
        Un Focus. Une landing. Une prochaine action.
      </h1>
      <p className="mt-3 max-w-[26rem] text-[14.5px] leading-relaxed text-muted-foreground sm:text-[15px]">
        Avant : trop d’outils, pas de site, pas de suite. Après : un projet au centre, un tableau,
        une landing en cinq minutes.
      </p>
      <div className="mt-5 w-full max-w-sm rounded-2xl border border-line bg-surface-2/70 px-4 py-3 text-left">
        <p className="text-[11px] font-medium tracking-wide text-muted-foreground uppercase">
          Aperçu accueil
        </p>
        <p className="mt-1 text-[14px] leading-snug sm:text-[14.5px]">
          Prompt copilote · action Focus · Composer
        </p>
      </div>
      <Button type="button" size="lg" className="mt-6 min-h-12 w-full max-w-sm" onClick={onStart}>
        Commencer
      </Button>
    </div>
  );
}
