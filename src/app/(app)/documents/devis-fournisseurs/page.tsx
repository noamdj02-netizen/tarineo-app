import { permanentRedirect } from "next/navigation";

/** Ancienne URL — filtre unifié sur /documents. */
export default function DevisFournisseursPage() {
  permanentRedirect("/documents?type=devis");
}
