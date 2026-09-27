import { PieceKindPage } from "@/components/metier/piece-kind-page";
import { R } from "@/lib/routes";

export const metadata = { title: "Facture distributeur" };

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
      title="Factures d’achat"
      tail="réglées ou à payer."
      text="Les factures fournisseur vivent ici. Déposez le PDF, reliez au chantier."
      empty="Aucune facture d’achat."
      dropHint="PDF facture enseigne."
      chantierSlug={q.chantier}
      partyId={q.party}
    />
  );
}
