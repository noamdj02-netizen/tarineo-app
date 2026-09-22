import type { Metadata } from "next";
import dynamic from "next/dynamic";
import Link from "next/link";
import { NAV_LANDING_PRODUIT } from "@/lib/landingNavigation";
import { urlSite } from "@/lib/siteUrl";
import { LandingSubpageShell } from "../_components/LandingSubpageShell";
import { LandingDistributorsSection } from "../LandingDistributorsSection";
import { LandingFeaturesSection } from "../LandingFeaturesSection";

const LandingFooter = dynamic(() =>
  import("../_components/LandingFooter").then((m) => ({ default: m.LandingFooter }))
);

const CTA_INSCRIPTION = "/inscription";

export const metadata: Metadata = {
  title: "Fonctionnalités | Tarineo",
  description:
    "Analyse IA des devis fournisseurs, alertes de hausse, suivi par distributeur, devis clients et facturation — pour artisans du bâtiment.",
  alternates: { canonical: `${urlSite()}/fonctionnalites` },
  openGraph: {
    title: "Fonctionnalités — Tarineo",
    description: "Détectez chaque hausse de prix en un scan.",
    url: `${urlSite()}/fonctionnalites`,
    type: "website",
    locale: "fr_FR",
  },
};

export default function FonctionnalitesPage() {
  return (
    <LandingSubpageShell titre="Fonctionnalités" footer={<LandingFooter />}>
      <LandingFeaturesSection ctaHref={CTA_INSCRIPTION} />
      <LandingDistributorsSection ctaHref={CTA_INSCRIPTION} />

      <section className="border-t border-black/[0.06] bg-[var(--landing-chip)]/40 py-16 sm:py-20">
        <div className="landing-container">
          <h2 className="landing-display mb-3 text-center text-2xl font-semibold text-[var(--landing-text)] sm:text-3xl">
            Tout ce que vous faites dans l&apos;application
          </h2>
          <p className="landing-body mx-auto mb-10 max-w-xl text-center text-base text-[var(--landing-muted)]">
            Chaque module correspond à une page de votre espace Tarineo après inscription.
          </p>
          <ul className="mx-auto grid max-w-4xl gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {NAV_LANDING_PRODUIT.map((item) => (
              <li key={item.id}>
                <Link
                  href={item.hrefApp}
                  className="flex h-full flex-col rounded-2xl border border-black/[0.08] bg-white p-5 transition-shadow hover:shadow-[0_8px_24px_rgba(0,0,0,0.06)]"
                >
                  <span className="landing-display text-lg font-semibold text-[var(--landing-text)]">{item.label}</span>
                  {item.description && (
                    <span className="landing-body mt-2 text-sm text-[var(--landing-muted)]">{item.description}</span>
                  )}
                  <span className="landing-body mt-4 text-sm font-medium text-[var(--landing-accent)]">Ouvrir →</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </LandingSubpageShell>
  );
}
