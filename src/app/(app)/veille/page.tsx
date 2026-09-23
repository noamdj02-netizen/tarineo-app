import { permanentRedirect } from "next/navigation";

/** Ancienne URL — veille intégrée dans /fournisseurs. */
export default function VeillePage() {
  permanentRedirect("/fournisseurs?onglet=veille");
}
