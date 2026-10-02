import { redirect } from "next/navigation";

/** Contenu abonnement conservé sur /abonnement — hub paramètres y redirige avec contexte. */
export default async function ParametresAbonnementPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const sp = await searchParams;
  const q = new URLSearchParams();
  for (const [k, v] of Object.entries(sp)) {
    if (v) q.set(k, v);
  }
  const qs = q.toString();
  redirect(`/abonnement${qs ? `?${qs}` : ""}`);
}
