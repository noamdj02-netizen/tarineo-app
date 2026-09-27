import { PieceKindPage } from "@/components/metier/piece-kind-page";
import { R } from "@/lib/routes";

export const metadata = { title: "Devis client" };

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ chantier?: string }>;
}) {
  const q = await searchParams;
  return (
    <PieceKindPage
      direction="out"
      kind="devis"
      base={R.clientDevis}
      label="Entreprise"
      title="Devis client"
      tail="à envoyer."
      text="Choisissez un modèle, ou glissez un devis déjà rédigé. Ouvrez la pièce pour ajouter des lignes."
      empty="Pas encore de devis client. Partez d’un modèle ou d’un dépôt."
      dropHint="PDF devis déjà prêt, ou partez d’un modèle."
      showTemplates
      chantierSlug={q.chantier}
    />
  );
}
