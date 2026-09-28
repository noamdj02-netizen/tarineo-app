import { PieceKindPage } from "@/components/metier/piece-kind-page";
import { R } from "@/lib/routes";

export const metadata = { title: "Bons d’enlèvement" };

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ chantier?: string; party?: string }>;
}) {
  const q = await searchParams;
  return (
    <PieceKindPage
      direction="in"
      kind="bon_enlevement"
      base={R.distributeurBe}
      label="Distributeur"
      title="Bons d’enlèvement"
      text="Retrouvez les bons d’enlèvement reçus de vos fournisseurs."
      empty="Aucun bon d’enlèvement. Importez un PDF pour commencer."
      dropHint="PDF bon d’enlèvement."
      chantierSlug={q.chantier}
      partyId={q.party}
    />
  );
}
