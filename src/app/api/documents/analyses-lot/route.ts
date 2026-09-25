import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import {
  lireDomaineDocument,
  resoudreDestinationApresAnalyse,
} from "@/lib/pipelineImportArtisan";
import { LABELS_TYPE } from "@/lib/documentLabels";

const querySchema = z.object({
  ids: z
    .string()
    .min(1)
    .transform((s) =>
      s
        .split(",")
        .map((id) => id.trim())
        .filter(Boolean),
    )
    .pipe(z.array(z.string().min(10).max(30)).max(150)),
});

export async function GET(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ erreur: "Non authentifié" }, { status: 401 });
  }

  const parsed = querySchema.safeParse({
    ids: new URL(req.url).searchParams.get("ids") ?? "",
  });
  if (!parsed.success) {
    return NextResponse.json({ erreur: "Identifiants invalides" }, { status: 400 });
  }

  const ids = parsed.data.ids;
  if (ids.length === 0) {
    return NextResponse.json({ documents: [], termine: true, total: 0, traites: 0 });
  }

  const documents = await prisma.document.findMany({
    where: { userId: session.user.id, id: { in: ids } },
    select: {
      id: true,
      status: true,
      type: true,
      distributor: true,
      rawExtraction: true,
      createdAt: true,
    },
    orderBy: { createdAt: "asc" },
  });

  const parId = new Map(documents.map((d) => [d.id, d]));
  const ordre = ids.filter((id) => parId.has(id));

  const lignes = ordre.map((id) => {
    const doc = parId.get(id)!;
    const destination = resoudreDestinationApresAnalyse({
      status: doc.status,
      type: doc.type,
      rawExtraction: doc.rawExtraction,
    });
    const libelleType = LABELS_TYPE[doc.type] ?? doc.type;
    const titre =
      doc.distributor?.trim() ||
      (destination.domaine === "entreprise" ? "Ventes clients" : libelleType);

    return {
      id: doc.id,
      status: doc.status,
      domaine: lireDomaineDocument(doc.rawExtraction),
      titre,
      libelleType,
      redirectTo: destination.redirectTo,
    };
  });

  const traites = lignes.filter((l) => l.status !== "PROCESSING").length;
  const termine = traites === lignes.length && lignes.length > 0;

  return NextResponse.json({
    documents: lignes,
    total: lignes.length,
    traites,
    termine,
  });
}
