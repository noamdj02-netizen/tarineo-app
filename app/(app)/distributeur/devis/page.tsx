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
      title="Devis d’achat"
      tail="à traiter."
      text="Glissez le devis du distributeur. Reliez-le au chantier, puis transformez-le pour le client."
      empty="Aucun devis d’achat. Déposez un PDF ci-dessus."
      dropHint="PDF devis fournisseur / enseigne."
      chantierSlug={q.chantier}
      partyId={q.party}
    />
  );
}
