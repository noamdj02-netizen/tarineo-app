import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { analyserDocument } from "@/lib/extraction";
import { isAnthropicConfigured } from "@/lib/anthropic";
import { verifierRateLimitAnalyse } from "@/lib/rateLimitIA";

/** Analyse Claude — peut durer jusqu'à ~60 s sur un gros PDF. */
export const maxDuration = 60;

export async function POST(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ erreur: "Non authentifié" }, { status: 401 });
  }

  const { id } = await params;
  const document = await prisma.document.findFirst({
    where: { id, userId: session.user.id },
    select: { id: true, status: true },
  });

  if (!document) {
    return NextResponse.json({ erreur: "Document introuvable" }, { status: 404 });
  }

  if (document.status === "VALIDATED" || document.status === "NEEDS_REVIEW") {
    return NextResponse.json({ ok: true, status: document.status });
  }

  if (!isAnthropicConfigured()) {
    return NextResponse.json(
      { erreur: "Analyse indisponible — configuration serveur incomplète." },
      { status: 503 },
    );
  }

  if (!verifierRateLimitAnalyse(session.user.id)) {
    return NextResponse.json(
      { erreur: "Quota d'analyses atteint. Réessayez dans une heure." },
      { status: 429 },
    );
  }

  const ok = await analyserDocument(id, session.user.id);
  const misAJour = await prisma.document.findFirst({
    where: { id, userId: session.user.id },
    select: { status: true },
  });

  return NextResponse.json({
    ok,
    status: misAJour?.status ?? "ERROR",
  });
}
