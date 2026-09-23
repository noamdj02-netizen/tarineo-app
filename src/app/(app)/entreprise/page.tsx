import { permanentRedirect } from "next/navigation";

/** Profil unifié sur /plus — onglet entreprise des paramètres. */
export default function EntreprisePage() {
  permanentRedirect("/plus?section=parametres&onglet=profil");
}
