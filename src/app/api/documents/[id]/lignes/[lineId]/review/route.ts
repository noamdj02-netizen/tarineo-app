import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/auth";
import { lineReviewsSchema, type LineReviews } from "@/lib/analyseDocument";
import { prisma } from "@/lib/prisma";

const corpsSchema = z.object({
  status: z.enum(["verified", "ignored", "none"]),
});

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string; lineId: string }> },
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ erreur: "Non autorisé" }, { status: 401 });
  }

  const { id: documentId, lineId } = await params;
  const corps = corpsSchema.safeParse(await request.json());
  if (!corps.success) {
    return NextResponse.json({ erreur: "Corps invalide" }, { status: 400 });
  }

  const document = await prisma.document.findFirst({
    where: { id: documentId, userId: session.user.id },
    select: { id: true, lineReviews: true, lineItems: { where: { id: lineId }, select: { id: true } } },
  });

  if (!document || document.lineItems.length === 0) {
    return NextResponse.json({ erreur: "Document ou ligne introuvable" }, { status: 404 });
  }

  const existant = lineReviewsSchema.safeParse(document.lineReviews);
  const reviews: LineReviews = existant.success ? { ...existant.data } : {};

  if (corps.data.status === "none") {
    delete reviews[lineId];
  } else {
    reviews[lineId] = { status: corps.data.status, at: new Date().toISOString() };
  }

  await prisma.document.update({
    where: { id: documentId },
    data: { lineReviews: reviews },
  });

  return NextResponse.json({ ok: true, reviews });
}
