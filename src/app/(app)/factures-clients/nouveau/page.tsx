import { redirect } from "next/navigation";

/** Les factures clients se créent uniquement par transformation d'un devis. */
export default function NouvelleFacturePage() {
  redirect("/devis-clients");
}
