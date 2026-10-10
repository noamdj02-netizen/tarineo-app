"use client";

import { CardAnimation01 } from "@/components/site/landing-v2/components/grid-animated-cards/card-animation-01";
import { CardAnimation02 } from "@/components/site/landing-v2/components/grid-animated-cards/card-animation-02";
import { CardAnimation03 } from "@/components/site/landing-v2/components/grid-animated-cards/card-animation-03";
import { CardAnimation04 } from "@/components/site/landing-v2/components/grid-animated-cards/card-animation-04";
import { FeatureCard } from "@/components/site/landing-v2/components/grid-animated-cards/feature-card";
import { launchBento } from "@/lib/site/landing-v2-content";

const ANIMATIONS = [
  { Comp: CardAnimation01, scale: "scale-75 sm:scale-90" },
  { Comp: CardAnimation02, scale: "scale-90" },
  { Comp: CardAnimation03, scale: "scale-90" },
  { Comp: CardAnimation04, scale: "scale-[0.8] md:scale-90" },
] as const;

/** Grille 2×2 animée — intégrée section #parcours (Launch UI / Align demo). */
export function GridAnimatedCards() {
  return (
    <div className="mx-auto grid w-full max-w-4xl grid-cols-1 gap-2 p-1 md:grid-cols-2 md:grid-rows-2 md:gap-3 md:p-2">
      {launchBento.items.map((item, i) => {
        const { Comp, scale } = ANIMATIONS[i];
        return (
          <FeatureCard key={item.title} title={item.title} description={item.text}>
            <Comp className={scale} />
          </FeatureCard>
        );
      })}
    </div>
  );
}
