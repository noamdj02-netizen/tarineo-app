import { NextResponse } from "next/server";
import { z } from "zod";
import { activateTool, deactivateTool } from "@/lib/connectors/actions";
import { loadConnectorSignals } from "@/lib/connectors/signals";
import { getDb } from "@/lib/db";

export const runtime = "nodejs";

const Body = z.object({
  toolId: z.string().trim().min(1).max(60),
});

export async function GET() {
  const db = await getDb();
  if (!db) return NextResponse.json({ error: "Non connecté." }, { status: 401 });
  return NextResponse.json(await loadConnectorSignals());
}

export async function PUT(req: Request) {
  const parsed = Body.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Outil inconnu." }, { status: 400 });
  const res = await activateTool(parsed.data.toolId);
  if (!res.ok) return NextResponse.json({ error: res.error }, { status: 400 });
  return NextResponse.json({ ok: true });
}

export async function DELETE(req: Request) {
  const parsed = Body.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Outil inconnu." }, { status: 400 });
  const res = await deactivateTool(parsed.data.toolId);
  if (!res.ok) return NextResponse.json({ error: res.error }, { status: 400 });
  return NextResponse.json({ ok: true });
}
