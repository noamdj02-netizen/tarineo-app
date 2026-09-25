import { redirect } from "next/navigation";

/**
 * Ancienne page « Dépenses » — fusionnée dans `/accueil` (objectifs BFA) et `/analyses`
 * (graphiques). Cette route ne fait que rediriger pour les favoris / anciens liens.
 *
 * Toujours actif côté API :
 * - `POST /depenses/export` — export comptable (voir `depenses/ExportBouton.tsx`)
 * - composants partagés dans `src/app/(app)/depenses/` (objectifs, export)
 */
export default function DepensesPage() {
  redirect("/accueil");
}
