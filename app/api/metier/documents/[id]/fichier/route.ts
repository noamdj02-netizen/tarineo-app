import { getDb } from "@/lib/db";
import { getDocument } from "@/lib/metier/queries";
import { pdfFromDocument } from "@/lib/metier/pdf/from-document";
import { getViewer } from "@/lib/session";

function mimeFromPath(path: string) {
  if (path.endsWith(".png")) return "image/png";
  if (path.endsWith(".jpg") || path.endsWith(".jpeg")) return "image/jpeg";
  if (path.endsWith(".webp")) return "image/webp";
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
      return new Response(new Uint8Array(buf), {
        headers: {
          "Content-Type": mimeFromPath(doc.file_path),
          "Content-Disposition": `inline; filename="${doc.title.replace(/"/g, "")}.pdf"`,
        },
      });
    }
  }

  const viewer = await getViewer();
  const { buffer, filename } = await pdfFromDocument(doc, viewer?.email);
  return new Response(new Uint8Array(buffer), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="${filename.replace(/"/g, "")}"`,
    },
  });
}
