import type { Metadata } from "next";
import dynamic from "next/dynamic";
import Link from "next/link";
import { urlSite } from "@/lib/siteUrl";
import { LandingSubpageShell } from "../_components/LandingSubpageShell";
import { LandingPricingSection } from "../LandingPricingSection";

const LandingFooter = dynamic(() =>
  import("../_components/LandingFooter").then((m) => ({ default: m.LandingFooter }))
);

const CTA_INSCRIPTION = "/inscription";

export const metadata: Metadata = {
  title: "Tarifs | Tarineo",
  description:
    "Formules Starter, Pro et Équipe pour artisans du bâtiment. Sans engagement, changez de plan à tout moment.",
  alternates: { canonical: `${urlSite()}/tarifs` },
  openGraph: {
    title: "Tarifs — Tarineo",
    description: "Un tarif adapté à la taille de votre activité.",
    url: `${urlSite()}/tarifs`,
    type: "website",
    locale: "fr_FR",
  },
};

export default function TarifsPage() {
  return (
    <LandingSubpageShell titre="Tarifs" footer={<LandingFooter />}>
      <LandingPricingSection ctaHref={CTA_INSCRIPTION} />
      <section className="landing-container pb-16 text-center sm:pb-24">
        <p className="landing-body text-base text-[var(--landing-muted)]">
          Déjà client ?{" "}
          <Link href="/connexion" className="font-medium text-[var(--landing-accent)] hover:underline">
            Gérez votre abonnement
          </Link>{" "}
          depuis votre compte.
        </p>
      </section>
    </LandingSubpageShell>
  );
}
