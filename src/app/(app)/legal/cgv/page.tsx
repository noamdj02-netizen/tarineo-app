import type { Metadata } from "next";
import { ContenuLegal } from "@/components/tarineo/ContenuLegal";
import { CGV_SECTIONS } from "@/lib/contenuLegal";

export const metadata: Metadata = {
  title: "Conditions générales de vente — Tarineo",
  description: "Conditions de vente et d'abonnement au service Tarineo.",
};

export default function CgvAppPage() {
  return (
    <ContenuLegal
      titre="Conditions générales de vente"
      intro="Dernière mise à jour : septembre 2026."
      sections={CGV_SECTIONS}
    />
  );
}
