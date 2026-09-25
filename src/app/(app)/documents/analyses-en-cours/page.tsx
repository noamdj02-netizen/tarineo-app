import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { AnalysesEnCoursConteneur } from "./AnalysesEnCoursConteneur";

function parserIds(raw: string | undefined): string[] {
  if (!raw?.trim()) return [];
  return raw
    .split(",")
    .map((s) => s.trim())
    .filter((id) => id.length >= 10 && id.length <= 30);
}

export default async function AnalysesEnCoursPage({
  searchParams,
}: {
  searchParams: Promise<{ ids?: string; retour?: string }>;
}) {
  const session = await auth();
  if (!session?.user?.id) redirect("/connexion");

  const { ids, retour } = await searchParams;
  const documentIds = parserIds(ids);
  if (documentIds.length === 0) {
    redirect("/documents");
  }

  const redirectWhenDone =
    retour && retour.startsWith("/") && !retour.startsWith("//") ? retour : "/analyses?import=1";
  const marquerOnboarding = redirectWhenDone.startsWith("/onboarding");

  const titre =
    documentIds.length > 1
      ? `${documentIds.length} documents en cours d'organisation`
      : "Organisation de votre document";

  return (
    <AnalysesEnCoursConteneur
      documentIds={documentIds}
      redirectWhenDone={redirectWhenDone}
      marquerOnboarding={marquerOnboarding}
      titre={titre}
    />
  );
}
