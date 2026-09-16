import { redirect } from "next/navigation";
import { auth } from "@/auth";

/** Les factures clients sont créées depuis un devis accepté — pas de création directe. */
export default async function NouvelleFacturePage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/connexion");
  redirect("/devis-clients");
}
