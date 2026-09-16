import { redirect } from "next/navigation";

/** Ancienne démo → historique fournisseur filtré. */
export default function BonsDeCommandePage() {
  redirect("/documents?type=BON_COMMANDE");
}
