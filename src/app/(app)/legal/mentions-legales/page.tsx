import type { Metadata } from "next";
import { ContenuLegal } from "@/components/tarineo/ContenuLegal";
import { MENTIONS_LEGALES_SECTIONS } from "@/lib/contenuLegal";

export const metadata: Metadata = {
  title: "Mentions légales — Tarineo",
  description: "Éditeur, hébergement et contact du service Tarineo.",
};

export default function MentionsLegalesAppPage() {
  return (
    <ContenuLegal
      titre="Mentions légales"
      intro="Dernière mise à jour : septembre 2026."
      sections={MENTIONS_LEGALES_SECTIONS}
    />
  );
}
