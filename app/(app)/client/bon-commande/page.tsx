import { PieceKindPage } from "@/components/metier/piece-kind-page";
import { R } from "@/lib/routes";

export const metadata = { title: "Bon de commande client" };

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ chantier?: string }>;
}) {
  const q = await searchParams;
  return (
    <PieceKindPage
      direction="out"
      kind="bon_commande"
      base={R.clientBc}
      label="Entreprise"
      title="Bons de commande"
      tail="client."
      text="BC à renvoyer au client. Déposez un PDF ou transformez un achat depuis la pièce."
      empty="Aucun bon de commande client."
      dropHint="PDF bon de commande client."
      chantierSlug={q.chantier}
    />
  );
}
