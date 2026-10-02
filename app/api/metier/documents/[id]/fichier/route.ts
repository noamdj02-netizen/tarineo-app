import { getDb } from "@/lib/db";
import { getDocument } from "@/lib/metier/queries";
import { pdfContentDisposition, pdfFromDocument } from "@/lib/metier/pdf/from-document";
import { getViewer } from "@/lib/session";

function mimeFromPath(path: string) {
  const lower = path.toLowerCase();
  if (lower.endsWith(".png")) return "image/png";
  if (lower.endsWith(".jpg") || lower.endsWith(".jpeg")) return "image/jpeg";
  if (lower.endsWith(".webp")) return "image/webp";
  if (lower.endsWith(".gif")) return "image/gif";
  return "application/pdf";
}

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const doc = await getDocument(id);
  if (!doc) return new Response("Introuvable", { status: 404 });

  const db = await getDb();
  if (db && doc.file_path) {
    const { data, error } = await db.supabase.storage.from("documents").download(doc.file_path);
    if (!error && data) {
      const buf = Buffer.from(await data.arrayBuffer());
      const type = mimeFromPath(doc.file_path);
      const ext = type.split("/")[1] === "pdf" ? "pdf" : type.split("/")[1] || "bin";
      return new Response(new Uint8Array(buf), {
        headers: {
          "Content-Type": type,
          "Content-Disposition": pdfContentDisposition(`${doc.title}.${ext}`, false),
          "Cache-Control": "private, no-store",
        },
      });
    }
  }

  try {
    const viewer = await getViewer();
    const { buffer, filename } = await pdfFromDocument(doc, viewer?.email);
    return new Response(new Uint8Array(buffer), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": pdfContentDisposition(filename, false),
        "Cache-Control": "private, no-store",
      },
    });
  } catch (err) {
    console.error("[fichier→pdf]", id, err);
    return new Response("Fichier indisponible.", { status: 500 });
  }
}
