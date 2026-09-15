import Image from "next/image";
import Link from "next/link";
import { LandingFeaturesMockup } from "./_components/LandingFeaturesMockup";
import { LandingReveal } from "./_components/motion/LandingReveal";
import { LandingStagger, LandingStaggerItem } from "./_components/motion/LandingStagger";

const POINTS = [
  "Suivez vos devis avec des alertes en temps réel.",
  "Analyse instantanée, résultats immédiats.",
];

interface Props {
  ctaHref: string;
}

export function LandingFeaturesSection({ ctaHref }: Props) {
  return (
    <section id="fonctionnalites" className="scroll-mt-28 bg-white py-12 sm:py-[60px]">
      <div className="landing-container flex flex-col items-center gap-10 lg:flex-row lg:items-start lg:gap-[129px]">
        <LandingFeaturesMockup />

        <LandingReveal variant="right" className="max-w-[543px] pt-0 lg:pt-[15px]">
          <h2 className="landing-display mb-6 text-[2rem] font-bold leading-[1.24] text-[var(--landing-text)] sm:text-[3.375rem]">
            Détectez chaque hausse de prix, en un scan.
          </h2>
          <p className="landing-body mb-6 max-w-[532px] text-base leading-normal text-[var(--landing-muted)]">
            Notre outil connecte votre activité à vos fournisseurs, en offrant une analyse fiable et accessible à tous
            les artisans, partout en France.
          </p>
          <LandingStagger className="mb-10 space-y-4">
            {POINTS.map((point) => (
              <LandingStaggerItem key={point}>
                <div className="flex items-center gap-3">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[var(--landing-chip)]">
                    <Image src="/landing/check.svg" alt="" width={16} height={16} className="h-4 w-4" />
                  </span>
                  <span className="landing-body text-base text-[var(--landing-muted)] sm:text-lg">{point}</span>
                </div>
              </LandingStaggerItem>
            ))}
          </LandingStagger>
          <Link
            href={ctaHref}
            className="landing-display inline-flex rounded-full bg-[var(--landing-text)] px-8 py-3.5 text-base font-medium text-white shadow-[var(--landing-shadow-btn)] transition-transform hover:opacity-90 active:scale-[0.98]"
          >
            Commencer
          </Link>
        </LandingReveal>
      </div>
    </section>
  );
}
