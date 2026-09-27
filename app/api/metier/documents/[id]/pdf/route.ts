import { getDocument } from "@/lib/metier/queries";
import { pdfFromDocument } from "@/lib/metier/pdf/from-document";
import { getViewer } from "@/lib/session";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [doc, viewer] = await Promise.all([getDocument(id), getViewer()]);
  if (!doc) return new Response("Introuvable", { status: 404 });
  const { buffer, filename } = await pdfFromDocument(doc, viewer?.email);
  return new Response(new Uint8Array(buffer), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${filename.replace(/"/g, "")}"`,
    },
  });
}
