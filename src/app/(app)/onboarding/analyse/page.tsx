import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { AnimationAnalyse } from "./AnimationAnalyse";

function parserIds(raw: string | undefined): string[] {
  if (!raw?.trim()) return [];
  return raw
    .split(",")
    .map((s) => s.trim())
    .filter((id) => id.length >= 10 && id.length <= 30);
}

export default async function OnboardingAnalysePage({
  searchParams,
}: {
  searchParams: Promise<{ n?: string; ids?: string }>;
}) {
  const session = await auth();
  if (!session?.user?.id) redirect("/connexion");

  const { n, ids } = await searchParams;
  const documentIds = parserIds(ids);
  if (documentIds.length > 0) {
    const params = new URLSearchParams({
      ids: documentIds.join(","),
      retour: "/onboarding/resume",
    });
    redirect(`/documents/analyses-en-cours?${params.toString()}`);
  }

  const nbParam = n && /^\d+$/.test(n) ? Number(n) : null;
  const nbDocs =
    nbParam ??
    (await prisma.document.count({
      where: { userId: session.user.id },
    }));

  return <AnimationAnalyse nbDocuments={nbDocs} />;
}
