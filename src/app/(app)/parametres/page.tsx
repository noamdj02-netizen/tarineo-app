import { permanentRedirect } from "next/navigation";

/** Profil unifié sur /plus — conservation de l'URL pour compatibilité. */
export default async function ParametresPage({
  searchParams,
}: {
  searchParams: Promise<{ onglet?: string; plan?: string }>;
}) {
  const params = await searchParams;
  const q = new URLSearchParams();
  q.set("section", "parametres");
  if (params.onglet) q.set("onglet", params.onglet);
  if (params.plan) q.set("plan", params.plan);
  permanentRedirect(`/plus?${q.toString()}`);
}
