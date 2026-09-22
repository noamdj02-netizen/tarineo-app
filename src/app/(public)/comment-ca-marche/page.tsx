import type { Metadata } from "next";
import dynamic from "next/dynamic";
import { urlSite } from "@/lib/siteUrl";
import { LandingSubpageShell } from "../_components/LandingSubpageShell";
import { LandingHowItWorksSection } from "../LandingHowItWorksSection";

const LandingFooter = dynamic(() =>
  import("../_components/LandingFooter").then((m) => ({ default: m.LandingFooter }))
);

export const metadata: Metadata = {
  title: "Comment ça marche | Tarineo",
  description:
    "Scannez un devis fournisseur en photo ou PDF, Tarineo compare chaque prix à votre historique d'achats et détecte les hausses en quelques secondes.",
  alternates: { canonical: `${urlSite()}/comment-ca-marche` },
  openGraph: {
    title: "Comment ça marche — Tarineo",
    description: "Protégez votre marge en 3 étapes simples.",
    url: `${urlSite()}/comment-ca-marche`,
    type: "website",
    locale: "fr_FR",
  },
};

export default function CommentCaMarchePage() {
  return (
    <LandingSubpageShell titre="Comment ça marche" footer={<LandingFooter />}>
      <LandingHowItWorksSection />
    </LandingSubpageShell>
  );
}
