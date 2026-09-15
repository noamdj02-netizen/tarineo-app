import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { AssistantCreation } from "@/components/tarineo/AssistantCreation";

export default async function NouveauDevisPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/connexion");
  return <AssistantCreation titre="Créer un devis" variante="devis" />;
}
