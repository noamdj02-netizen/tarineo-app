import { PieceKindPage } from "@/components/metier/piece-kind-page";
import { R } from "@/lib/routes";

export const metadata = { title: "Bon d’enlèvement" };

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
      tail="à retirer."
      text="Le bon d’enlèvement reste côté achat. Déposez-le ici, pas avec les devis."
      empty="Aucun bon d’enlèvement."
      dropHint="PDF bon d’enlèvement."
      mascot="09-devis-valide"
      chantierSlug={q.chantier}
      partyId={q.party}
    />
  );
}
