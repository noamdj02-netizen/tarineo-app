import type { Metadata } from "next";
import { ContenuLegal } from "@/components/tarineo/ContenuLegal";
import { COOKIES_SECTIONS } from "@/lib/contenuLegal";

export const metadata: Metadata = {
  title: "Politique cookies — Tarineo",
  description: "Utilisation des cookies et traceurs sur Tarineo.",
};

export default function CookiesAppPage() {
  return (
    <ContenuLegal
      titre="Politique cookies"
      intro="Dernière mise à jour : septembre 2026."
      sections={COOKIES_SECTIONS}
    />
  );
}
