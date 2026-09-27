import { PieceKindPage } from "@/components/metier/piece-kind-page";
import { R } from "@/lib/routes";

export const metadata = { title: "Facture client" };

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ chantier?: string }>;
}) {
  const q = await searchParams;
  return (
    <PieceKindPage
      direction="out"
      kind="facture"
      base={R.clientFacture}
      label="Entreprise"
      title="Factures"
      tail="à encaisser."
      text="Les factures client sont ici, séparées des devis. Déposez ou ouvrez une pièce pour ajouter des lignes."
      empty="Aucune facture client."
      dropHint="PDF facture client."
      chantierSlug={q.chantier}
    />
  );
}
