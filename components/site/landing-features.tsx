import { Reveal } from "@/components/motion/reveal";
import { InView } from "@/components/site/in-view";
import { LandingFeatureCard, type FeatureGlowTint } from "@/components/site/landing-feature-card";
import { FEATURES } from "@/lib/site/content";

const GLOW_CYCLE: FeatureGlowTint[] = ["glow-2", "glow-3", "glow-1"];

/** Grille des 6 fonctions produit sur la landing. */
export function LandingFeatures() {
  return (
    <InView className="mx-auto grid max-w-[1080px] gap-5 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3" stagger={0.05}>
      {FEATURES.map((f, i) => (
        <Reveal key={f.title}>
          <LandingFeatureCard
            mascot={f.mascot}
            title={f.title}
            description={f.text}
            glow={GLOW_CYCLE[i % GLOW_CYCLE.length]}
          />
        </Reveal>
      ))}
    </InView>
  );
}
