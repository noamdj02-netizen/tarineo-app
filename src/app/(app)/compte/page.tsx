import { permanentRedirect } from "next/navigation";

/** Profil unifié sur /plus — conservation de l'URL pour compatibilité. */
export default function ComptePage() {
  permanentRedirect("/plus?section=compte");
}
