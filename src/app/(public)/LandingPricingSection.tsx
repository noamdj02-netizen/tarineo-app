import { LandingPricingGrid } from "./_components/LandingPricingGrid";
import { LandingReveal } from "./_components/motion/LandingReveal";

interface Plan {
  nom: string;
  prix: string;
  desc: string;
  features: string[];
  populaire?: boolean;
}

const PLANS: Plan[] = [
  {
    nom: "Starter",
    prix: "17€",
    desc: "Pour démarrer et tester sur vos premiers chantiers.",
    features: ["150 documents / mois", "3 distributeurs suivis", "Historique 12 mois"],
  },
  {
    nom: "Pro",
    prix: "29€",
    desc: "Pour les artisans qui veulent tout suivre, sans limite.",
    features: [
      "400 documents / mois",
      "Tous les distributeurs",
      "Devis client inclus",
      "Calcul de marge automatique",
    ],
    populaire: true,
  },
  {
    nom: "Équipe",
    prix: "49€",
    desc: "Pour les structures avec plusieurs chantiers actifs.",
    features: ["1000 documents / mois", "Tout Pro inclus", "Dashboard dirigeant (bientôt disponible)"],
  },
];

interface Props {
  ctaHref: string;
}

export function LandingPricingSection({ ctaHref }: Props) {
  return (
    <section id="tarifs" className="scroll-mt-28 bg-white py-16 sm:pb-28 sm:pt-20">
      <div className="landing-container">
        <LandingReveal variant="up" className="mx-auto mb-14 max-w-[640px] text-center">
          <p className="landing-gradient-text landing-display mb-4 text-base font-medium">Tarifs</p>
          <h2 className="landing-display mb-4 text-[2rem] font-semibold leading-[1.24] text-[var(--landing-text)] sm:text-[2.5rem]">
            Un tarif adapté à la taille de votre activité
          </h2>
          <p className="landing-body text-base text-[var(--landing-muted)]">
            Sans engagement. Changez de formule à tout moment, en fonction de votre volume de devis.
          </p>
        </LandingReveal>

        <LandingPricingGrid plans={PLANS} ctaHref={ctaHref} />
      </div>
    </section>
  );
}
