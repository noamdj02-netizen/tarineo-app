import { redirect } from "next/navigation";

/** Ancienne route → préférences utilisateur dans Paramètres. */
export default function CompteRedirectPage() {
  redirect("/parametres/compte");
}
