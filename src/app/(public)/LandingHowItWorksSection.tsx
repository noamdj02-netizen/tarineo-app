import Image from "next/image";
import { LandingHowItWorksPhone } from "./_components/LandingHowItWorksPhone";
import { LandingReveal } from "./_components/motion/LandingReveal";
import { LandingStagger, LandingStaggerItem } from "./_components/motion/LandingStagger";

const ETAPES = [
  {
    icon: "/landing/icon-bank.svg",
    titre: "D'abord, scannez votre devis",
    texte: "Prenez une photo, importez un PDF ou transférez par mail. Aucun paramétrage nécessaire.",
  },
  {
    icon: "/landing/icon-locate.svg",
    titre: "Suivez les hausses en temps réel",
    texte: "Surveillez l'évolution de vos prix fournisseurs avec des alertes instantanées.",
  },
  {
    icon: "/landing/icon-support.svg",
    titre: "Un support dédié aux artisans",
    texte: "Une équipe disponible pour vous accompagner sur toutes vos questions.",
  },
];

export function LandingHowItWorksSection() {
  return (
    <section id="comment-ca-marche" className="scroll-mt-28 bg-white py-16 sm:py-24 lg:py-[193px]">
      <div className="landing-container flex flex-col items-center gap-12 lg:flex-row lg:items-center lg:justify-between lg:gap-16">
        <LandingReveal variant="left" className="w-full max-w-[505px] shrink-0">
          <h2 className="landing-display mb-4 text-[2rem] font-bold leading-[1.24] text-[var(--landing-text)] sm:text-[3.375rem]">
            Commencez à protéger votre marge
          </h2>
          <p className="landing-body mb-10 max-w-[475px] text-base leading-normal text-[var(--landing-muted)]">
            En intégrant l&apos;IA et l&apos;OCR, Tarineo transforme la gestion des achats des artisans du bâtiment,
            rendant chaque devis plus simple à vérifier.
          </p>

          <LandingStagger className="space-y-8 sm:space-y-[32px]">
            {ETAPES.map((etape) => (
              <LandingStaggerItem key={etape.titre}>
                <div className="flex gap-6">
                  <span className="flex h-[52px] w-[52px] shrink-0 items-center justify-center rounded-xl bg-[var(--landing-chip)]">
                    <Image src={etape.icon} alt="" width={24} height={24} className="h-6 w-6" />
                  </span>
                  <div className="min-w-0 pt-0.5">
                    <p className="landing-display mb-2 text-xl font-semibold text-[var(--landing-text)] sm:text-2xl">{etape.titre}</p>
                    <p className="landing-body text-base leading-normal text-[var(--landing-muted)]">{etape.texte}</p>
                  </div>
                </div>
              </LandingStaggerItem>
            ))}
          </LandingStagger>
        </LandingReveal>

        <LandingHowItWorksPhone />
      </div>
    </section>
  );
}
