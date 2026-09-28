import { PieceKindPage } from "@/components/metier/piece-kind-page";
import { R } from "@/lib/routes";

export const metadata = { title: "Factures clients" };

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
      title="Factures clients"
      text="Suivez les factures émises pour vos clients."
      empty="Aucune facture client. Transformez une commande ou importez un PDF."
      dropHint="PDF facture client."
      chantierSlug={q.chantier}
    />
  );
}
