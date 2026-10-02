import { PieceKindPage } from "@/components/metier/piece-kind-page";
import { R } from "@/lib/routes";

export const metadata = { title: "Devis clients" };

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
      title="Devis clients"
      text="Créez, envoyez et suivez vos devis."
      empty="Pas encore de devis. Créez-en un ou importez un document."
      dropHint="Importez un PDF ou une photo de devis existant."
      ornament="mark"
      showTemplates
      chantierSlug={q.chantier}
    />
  );
}
