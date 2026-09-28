import { getDocument } from "@/lib/metier/queries";
import { pdfFromDocument } from "@/lib/metier/pdf/from-document";
import { getViewer } from "@/lib/session";

export const runtime = "nodejs";
export const maxDuration = 30;

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const download = new URL(req.url).searchParams.has("dl");
  const [doc, viewer] = await Promise.all([getDocument(id), getViewer()]);
  if (!doc) return new Response("Introuvable", { status: 404 });
  try {
    const { buffer, filename } = await pdfFromDocument(doc, viewer?.email);
    if (!buffer?.length) {
      console.error("[pdf] buffer vide", id);
      return new Response("Génération PDF impossible.", { status: 500 });
    }
    return new Response(new Uint8Array(buffer), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `${download ? "attachment" : "inline"}; filename="${filename.replace(/"/g, "")}"`,
      },
    });
  } catch (err) {
    console.error("[pdf]", id, err);
    const message = err instanceof Error ? err.message : "Génération PDF impossible.";
    return new Response(message, { status: 500, headers: { "Content-Type": "text/plain; charset=utf-8" } });
  }
}
