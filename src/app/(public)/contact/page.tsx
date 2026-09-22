import type { Metadata } from "next";
import dynamic from "next/dynamic";
import Link from "next/link";
import { urlSite } from "@/lib/siteUrl";
import { LandingSubpageShell } from "../_components/LandingSubpageShell";
import { LandingFaqSection } from "../LandingFaqSection";

const LandingFooter = dynamic(() =>
  import("../_components/LandingFooter").then((m) => ({ default: m.LandingFooter }))
);

export const metadata: Metadata = {
  title: "Contact | Tarineo",
  description: "Questions sur Tarineo ? Consultez la FAQ ou écrivez à contact@tarineo.com.",
  alternates: { canonical: `${urlSite()}/contact` },
  openGraph: {
    title: "Contact — Tarineo",
    description: "FAQ et support pour artisans du bâtiment.",
    url: `${urlSite()}/contact`,
    type: "website",
    locale: "fr_FR",
  },
};

export default function ContactPage() {
  return (
    <LandingSubpageShell titre="Contact" footer={<LandingFooter />}>
      <section className="border-b border-black/[0.06] bg-white">
        <div className="landing-container grid gap-8 py-10 sm:grid-cols-2 sm:py-14">
          <div className="rounded-2xl border border-black/[0.08] bg-[var(--landing-chip)]/50 p-6 sm:p-8">
            <h2 className="landing-display mb-2 text-xl font-semibold text-[var(--landing-text)]">Email</h2>
            <a
              href="mailto:contact@tarineo.com"
              className="landing-gradient-text landing-display text-2xl font-medium break-all"
            >
              contact@tarineo.com
            </a>
            <p className="landing-body mt-4 text-sm text-[var(--landing-muted)]">
              Réponse sous 24 h ouvrées pour toute question produit, facturation ou partenariat.
            </p>
          </div>
          <div className="rounded-2xl border border-black/[0.08] bg-white p-6 sm:p-8">
            <h2 className="landing-display mb-2 text-xl font-semibold text-[var(--landing-text)]">Essayer Tarineo</h2>
            <p className="landing-body mb-6 text-sm text-[var(--landing-muted)]">
              Créez un compte gratuitement et importez votre premier devis fournisseur.
            </p>
            <Link
              href="/inscription"
              className="landing-gradient-bg landing-display inline-flex rounded-full px-8 py-3.5 text-base font-medium text-white"
            >
              Commencer
            </Link>
          </div>
        </div>
      </section>
      <LandingFaqSection />
    </LandingSubpageShell>
  );
}
