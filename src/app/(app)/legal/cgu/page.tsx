import type { Metadata } from "next";
import { ContenuLegal } from "@/components/tarineo/ContenuLegal";
import { CGU_SECTIONS } from "@/lib/contenuLegal";

export const metadata: Metadata = {
  title: "Conditions générales d'utilisation — Tarineo",
  description: "Conditions d'utilisation du service Tarineo pour artisans du bâtiment.",
};

export default function CguAppPage() {
  return (
    <ContenuLegal
      titre="Conditions générales d'utilisation"
      intro="Dernière mise à jour : septembre 2026."
      sections={CGU_SECTIONS}
    />
  );
}
