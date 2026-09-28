import { PieceKindPage } from "@/components/metier/piece-kind-page";
import { R } from "@/lib/routes";

export const metadata = { title: "Bons de commande distributeur" };

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ chantier?: string; party?: string }>;
}) {
  const q = await searchParams;
  return (
    <PieceKindPage
      direction="in"
      kind="bon_commande"
      base={R.distributeurBc}
      label="Distributeur"
      title="Bons de commande distributeur"
      text="Retrouvez les bons de commande reçus de vos fournisseurs."
      empty="Aucun bon de commande d’achat. Importez un PDF pour commencer."
      dropHint="PDF bon de commande enseigne."
      chantierSlug={q.chantier}
      partyId={q.party}
    />
  );
}
