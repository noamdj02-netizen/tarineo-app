import { PieceKindPage } from "@/components/metier/piece-kind-page";
import { R } from "@/lib/routes";

export const metadata = { title: "Devis clients" };

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ chantier?: string }>;
}) {
  const q = await searchParams;
  return (
    <PieceKindPage
      direction="out"
      kind="devis"
      base={R.clientDevis}
      label="Entreprise"
      title="Devis clients"
      text="Créez, suivez et transformez vos devis clients."
      empty="Pas encore de devis client. Partez d’un modèle ou importez un PDF."
      dropHint="PDF devis déjà prêt, ou partez d’un modèle."
      ornament="mark"
      showTemplates
      chantierSlug={q.chantier}
    />
  );
}
