// DELETE /api/account/api-keys/:id → révoque une clé
import { NextResponse } from "next/server";
import { data } from "@/lib/mcp/data";
import { getCurrentUserId } from "@/lib/mcp/session";

export const runtime = "nodejs";

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const userId = await getCurrentUserId();
  if (!userId) return NextResponse.json({ error: "Non connecté." }, { status: 401 });

  const { id } = await params;
  const revoked = await data.revokeApiKey(userId, id);
  return revoked
    ? NextResponse.json({ ok: true })
    : NextResponse.json({ error: "Clé introuvable." }, { status: 404 });
}
