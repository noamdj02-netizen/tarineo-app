import { redirect } from "next/navigation";

/**
 * L'écran Analyses démo est retiré : les hausses et dépenses vivent sur le dashboard
 * et sur chaque fiche document / fournisseur.
 */
export default function AnalysesPage() {
  redirect("/accueil");
}
