import { permanentRedirect } from "next/navigation";

/** Parcours login redirige directement vers /accueil — URL conservée pour compatibilité. */
export default function ApresConnexionPage() {
  permanentRedirect("/accueil");
}
