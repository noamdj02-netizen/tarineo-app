import Image from "next/image";
import { LandingHeroIntro } from "./_components/LandingHeroIntro";
import { LandingHeroPhoneLazy } from "./LandingHeroPhoneLazy";

interface Props {
  ctaHref: string;
  ctaLabel: string;
}

export function LandingHero({ ctaHref, ctaLabel }: Props) {
  return (
    <section className="relative min-h-[640px] overflow-x-hidden pb-0 pt-24 sm:min-h-[800px] sm:pb-0 sm:pt-28">
      <Image
        src="/landing/hero-bg.jpg"
        alt="Artisan du bâtiment contrôlant un devis fournisseur"
        fill
        priority
        className="object-cover object-center"
        sizes="100vw"
      />
      <div className="absolute inset-0 bg-black/45" aria-hidden="true" />

      <div className="landing-container relative">
        <LandingHeroIntro ctaHref={ctaHref} ctaLabel={ctaLabel} />

        {/* 886 px Figma — téléphone calé en bas, transition directe vers la section suivante */}
        <div className="relative z-10 mx-auto -mb-2 mt-10 w-full max-w-[886px] sm:-mb-4 sm:mt-14">
          <LandingHeroPhoneLazy />
        </div>
      </div>

      <div
        className="pointer-events-none absolute inset-x-0 bottom-0 h-[211px] bg-gradient-to-b from-transparent via-[rgba(243,243,245,0.3)] via-[48%] to-[var(--landing-hero-fade)]"
        aria-hidden="true"
      />
    </section>
  );
}
