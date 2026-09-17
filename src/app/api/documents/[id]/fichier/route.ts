import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { DOCUMENTS_BUCKET, getSupabaseAdmin } from "@/lib/supabase";

function typeMimeDepuisExtension(fileKey: string): string {
  const extension = fileKey.split(".").pop()?.toLowerCase();
  switch (extension) {
    case "pdf":
      return "application/pdf";
    case "png":
      return "image/png";
    case "jpg":
    case "jpeg":
      return "image/jpeg";
    case "heic":
      return "image/heic";
    default:
      return "application/octet-stream";
  }
}

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user?.id) {
    return new Response("Non autorisé", { status: 401 });
  }

  const document = await prisma.document.findFirst({
    where: { id, userId: session.user.id },
    select: { fileKey: true },
  });
  if (!document) {
    return new Response("Document introuvable", { status: 404 });
  }

  const { data, error } = await getSupabaseAdmin().storage.from(DOCUMENTS_BUCKET).download(document.fileKey);
  if (error || !data) {
    return new Response("Fichier introuvable", { status: 404 });
  }

  const buffer = Buffer.from(await data.arrayBuffer());

  return new Response(buffer, {
    headers: {
      "Content-Type": typeMimeDepuisExtension(document.fileKey),
      "Content-Disposition": "inline",
      "Cache-Control": "private, max-age=300",
    },
  });
}
