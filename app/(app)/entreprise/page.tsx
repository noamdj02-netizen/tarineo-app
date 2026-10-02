import { redirect } from "next/navigation";

/** Ancienne route → hub paramètres entreprise. */
export default function EntrepriseRedirectPage() {
  redirect("/parametres/entreprise");
}
