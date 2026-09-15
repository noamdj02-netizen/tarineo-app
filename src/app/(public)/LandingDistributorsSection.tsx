import Image from "next/image";
import Link from "next/link";
import { LandingDistributorsVisual } from "./_components/LandingDistributorsVisual";
import { LandingReveal } from "./_components/motion/LandingReveal";
import { LandingStagger, LandingStaggerItem } from "./_components/motion/LandingStagger";

const POINTS = [
  "Compatible Cedeo, Point P, Rexel et 30+ distributeurs.",
  "Détection des hausses en moins de 10 secondes.",
];

interface Props {
  ctaHref: string;
}

export function LandingDistributorsSection({ ctaHref }: Props) {
  return (
    <section className="bg-white py-16 sm:py-24">
      <div className="landing-container flex flex-col items-center gap-12 lg:flex-row lg:items-center lg:gap-[154px]">
        <LandingReveal variant="left" className="max-w-[453px] shrink-0">
          <h2 className="landing-display mb-6 text-[2rem] font-bold leading-[1.24] text-[var(--landing-text)] sm:text-[3.375rem]">
            Compatible avec tous vos distributeurs habituels.
          </h2>
          <p className="landing-body mb-6 text-base leading-normal text-[var(--landing-muted)]">
            Photo, PDF ou mail : Tarineo s&apos;adapte au format de vos devis, sans configuration complexe.
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

        <LandingDistributorsVisual />
      </div>
    </section>
  );
}
