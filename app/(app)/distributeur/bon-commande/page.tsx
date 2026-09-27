import { PieceKindPage } from "@/components/metier/piece-kind-page";
import { R } from "@/lib/routes";

export const metadata = { title: "Bon de commande distributeur" };

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
      title="Bons de commande"
      tail="reçus."
      text="Déposez le BC du distributeur. Il reste rattaché au chantier, à part des devis."
      empty="Aucun bon de commande d’achat."
      dropHint="PDF bon de commande enseigne."
      chantierSlug={q.chantier}
      partyId={q.party}
    />
  );
}
