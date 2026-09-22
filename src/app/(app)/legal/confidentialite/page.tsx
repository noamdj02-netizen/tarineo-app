import type { Metadata } from "next";
import { ContenuLegal } from "@/components/tarineo/ContenuLegal";
import { CONFIDENTIALITE_SECTIONS } from "@/lib/contenuLegal";

export const metadata: Metadata = {
  title: "Politique de confidentialité — Tarineo",
  description: "Comment Tarineo traite vos données personnelles et vos documents fournisseurs.",
};

export default function ConfidentialiteAppPage() {
  return (
    <ContenuLegal
      titre="Politique de confidentialité"
      intro="Dernière mise à jour : septembre 2026."
      sections={CONFIDENTIALITE_SECTIONS}
    />
  );
}
