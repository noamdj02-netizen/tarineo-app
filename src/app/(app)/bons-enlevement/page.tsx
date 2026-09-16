import { redirect } from "next/navigation";

/** Ancienne démo → historique fournisseur filtré. */
export default function BonsEnlevementPage() {
  redirect("/documents?type=BON_ENLEVEMENT");
}
