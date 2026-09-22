import type { Metadata } from "next";
import dynamic from "next/dynamic";
import Link from "next/link";
import { LandingSubpageShell } from "../_components/LandingSubpageShell";

const LandingFooter = dynamic(() =>
  import("../_components/LandingFooter").then((m) => ({ default: m.LandingFooter }))
);

export const metadata: Metadata = {
  title: "À propos — Tarineo",
  description:
    "Tarineo aide les artisans du bâtiment à contrôler leurs devis fournisseurs et à protéger leur marge.",
};

export default function AProposPage() {
  return (
    <LandingSubpageShell
      titre="À propos de Tarineo"
      intro="Un outil pensé sur le terrain, pour les artisans qui n'ont pas le temps de comparer chaque ligne à la main."
      footer={<LandingFooter />}
    >
      <div className="landing-container flex flex-col gap-6 py-10 text-sm leading-relaxed text-[#53616A] sm:py-14">
        <p>
          Tarineo analyse vos devis et factures fournisseurs (Cedeo, Point P, Rexel, Brossette, etc.) et compare
          chaque prix à <strong className="font-semibold text-[#172935]">votre propre historique d&apos;achats</strong>
          — jamais à un comparateur public. Si un prix augmente, vous le voyez tout de suite, en euros et en
          pourcentage.
        </p>
        <p>
          Le produit est développé en France, avec hébergement des données en Union européenne. Notre priorité :
          simplicité sur chantier, pas une usine à gaz comptable.
        </p>
        <ul className="list-disc space-y-2 pl-5">
          <li>Import photo, PDF ou scan depuis votre téléphone</li>
          <li>Alertes de hausse et comparateur inter-enseignes sur votre historique</li>
          <li>Devis clients PDF et suivi des objectifs fournisseurs (BFA)</li>
        </ul>
        <p>
          <Link href="/inscription" className="font-semibold text-[#EC5821] hover:opacity-90">
            Essayer Tarineo gratuitement
          </Link>
          {" · "}
          <Link href="/contact" className="font-semibold text-[#EC5821] hover:opacity-90">
            Nous contacter
          </Link>
        </p>
      </div>
    </LandingSubpageShell>
  );
}
