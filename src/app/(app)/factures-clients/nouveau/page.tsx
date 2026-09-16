import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { AssistantCreation } from "@/components/tarineo/AssistantCreation";

export default async function NouvelleFacturePage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/connexion");

  let profilComplet = false;
  try {
    const profil = await prisma.companyProfile.findUnique({
      where: { userId: session.user.id },
      select: { id: true, siret: true, raisonSociale: true },
    });
    profilComplet = Boolean(profil?.siret && profil?.raisonSociale);
  } catch {
    profilComplet = false;
  }

  return (
    <AssistantCreation
      titre="Créer une facture"
      variante="facture"
      profilEntrepriseComplet={profilComplet}
    />
  );
}
