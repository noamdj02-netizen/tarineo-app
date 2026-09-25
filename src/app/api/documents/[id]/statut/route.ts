import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import {
  lireDomaineDocument,
  resoudreDestinationApresAnalyse,
} from "@/lib/pipelineImportArtisan";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ erreur: "Non authentifié" }, { status: 401 });
  }

  const { id } = await params;
  const document = await prisma.document.findFirst({
    where: { id, userId: session.user.id },
    select: { status: true, type: true, rawExtraction: true },
  });

  if (!document) {
    return NextResponse.json({ erreur: "Document introuvable" }, { status: 404 });
  }

  const destination = resoudreDestinationApresAnalyse({
    status: document.status,
    type: document.type,
    rawExtraction: document.rawExtraction,
  });

  return NextResponse.json({
    status: document.status,
    redirectTo: destination.redirectTo,
    sectionHref: destination.sectionHref,
    libelleDestination: destination.libelleDestination,
    domaine: lireDomaineDocument(document.rawExtraction),
  });
}
