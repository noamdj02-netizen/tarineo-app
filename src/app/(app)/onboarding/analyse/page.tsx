import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { AnimationAnalyse } from "./AnimationAnalyse";

export default async function OnboardingAnalysePage({
  searchParams,
}: {
  searchParams: Promise<{ n?: string }>;
}) {
  const session = await auth();
  if (!session?.user?.id) redirect("/connexion");

  const { n } = await searchParams;
  const nbParam = n && /^\d+$/.test(n) ? Number(n) : null;
  const nbDocs =
    nbParam ??
    (await prisma.document.count({
      where: { userId: session.user.id },
    }));

  return <AnimationAnalyse nbDocuments={nbDocs} />;
}
