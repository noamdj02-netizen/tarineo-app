import { PieceKindPage } from "@/components/metier/piece-kind-page";
import { R } from "@/lib/routes";

export const metadata = { title: "Devis distributeur" };

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ chantier?: string; party?: string }>;
}) {
  const q = await searchParams;
  return (
    <PieceKindPage
      direction="in"
      kind="devis"
      base={R.distributeurDevis}
      label="Distributeur"
      title="Devis distributeur"
      text="Retrouvez les documents reçus de vos fournisseurs."
      empty="Aucun devis distributeur. Importez un PDF pour commencer."
      dropHint="PDF devis fournisseur / enseigne."
      chantierSlug={q.chantier}
      partyId={q.party}
    />
  );
}
