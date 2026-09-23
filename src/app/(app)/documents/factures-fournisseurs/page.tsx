import { permanentRedirect } from "next/navigation";

/** Ancienne URL — filtre unifié sur /documents. */
export default function FacturesFournisseursPage() {
  permanentRedirect("/documents?type=factures");
}
