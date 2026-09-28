import { PieceKindPage } from "@/components/metier/piece-kind-page";
import { R } from "@/lib/routes";

export const metadata = { title: "Factures distributeur" };

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ chantier?: string; party?: string }>;
}) {
  const q = await searchParams;
  return (
    <PieceKindPage
      direction="in"
      kind="facture"
      base={R.distributeurFacture}
      label="Distributeur"
      title="Factures distributeur"
      text="Retrouvez les factures reçues de vos fournisseurs."
      empty="Aucune facture d’achat. Importez un PDF pour commencer."
      dropHint="PDF facture enseigne."
      chantierSlug={q.chantier}
      partyId={q.party}
    />
  );
}
