import { DeferredDiscoverStrip, DeferredSolutionCarousel } from "@/components/site/landing-deferred";
import { LandingSection, LandingSectionHead } from "@/components/site/landing-section";

/** Section #solution — même grille et en-tête que Fonctions / Étapes. */
export function LandingProductShowcase() {
  return (
    <LandingSection id="solution" tone="muted" className="bg-bg">
      <LandingSectionHead
        label="Comment ça marche"
        title="Tout autour de tes projets,"
        tail="dans un seul cockpit."
        text="Accueil, stack, copilote : trois piliers pour avancer sans jongler entre les onglets."
      />
      <div className="mx-auto flex max-w-[1080px] flex-col gap-8 sm:gap-12">
        <DeferredSolutionCarousel />
        <DeferredDiscoverStrip />
      </div>
    </LandingSection>
  );
}
