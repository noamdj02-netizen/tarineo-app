import { auth } from "@/auth";
import { features } from "@/lib/features";
import { reponseApiFeatureDesactivee } from "@/lib/featureGating";
import { prisma } from "@/lib/prisma";
import { DOCUMENTS_BUCKET, getSupabaseAdmin, isSupabaseConfigured } from "@/lib/supabase";

/** Sert le PDF d'un devis client (inline) — isolé par userId. */
export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!features.clientBilling) return reponseApiFeatureDesactivee();

  const { id } = await params;
  const session = await auth();
  if (!session?.user?.id) {
    return new Response("Non autorisé", { status: 401 });
  }

  const devis = await prisma.clientQuote.findFirst({
    where: { id, userId: session.user.id },
    select: { pdfKey: true, numero: true },
  });
  if (!devis?.pdfKey) {
    return new Response("PDF introuvable", { status: 404 });
  }
  if (!isSupabaseConfigured()) {
    return new Response("Stockage indisponible", { status: 503 });
  }

  const { data, error } = await getSupabaseAdmin().storage.from(DOCUMENTS_BUCKET).download(devis.pdfKey);
  if (error || !data) {
    return new Response("Fichier introuvable", { status: 404 });
  }

  const buffer = Buffer.from(await data.arrayBuffer());
  const nomFichier = `devis-${devis.numero.replace(/[^\w.-]+/g, "_")}.pdf`;

  return new Response(buffer, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="${nomFichier}"`,
      "Cache-Control": "private, max-age=60",
    },
  });
}
