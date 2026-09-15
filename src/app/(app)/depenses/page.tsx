import { redirect } from "next/navigation";

// Fusionnée dans /accueil (section "Vos objectifs") pour ne plus faire choisir
// l'artisan entre deux pages qui se recoupaient — cette route ne reste que pour ne
// pas casser les liens existants (ex. l'export comptable pointait ici).
export default function DepensesPage() {
  redirect("/accueil");
}
