import { PieceKindPage } from "@/components/metier/piece-kind-page";
import { R } from "@/lib/routes";

export const metadata = { title: "Commandes clients" };

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
      title="Commandes clients"
      text="Suivez les bons de commande envoyés à vos clients."
      empty="Aucune commande client. Transformez un devis ou importez un PDF."
      dropHint="PDF bon de commande client."
      chantierSlug={q.chantier}
    />
  );
}
