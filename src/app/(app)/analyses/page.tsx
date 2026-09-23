import { permanentRedirect } from "next/navigation";

/** Ancienne URL — analyses intégrées dans /fournisseurs. */
export default async function AnalysesPage({
  searchParams,
}: {
  searchParams: Promise<{ mois?: string }>;
}) {
  const { mois } = await searchParams;
  const suffixe = mois ? `&mois=${encodeURIComponent(mois)}` : "";
  permanentRedirect(`/fournisseurs?onglet=analyses${suffixe}`);
}
