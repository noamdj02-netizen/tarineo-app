// GET  /api/account/api-keys  → liste des clés (sans la clé en clair)
// POST /api/account/api-keys  → crée une clé, renvoie la clé en clair UNE SEULE FOIS
import { NextResponse } from "next/server";
import { z } from "zod";
import { data } from "@/lib/mcp/data";
import { generateApiKey, parseScopes } from "@/lib/mcp/api-keys";
import { getCurrentUserId } from "@/lib/mcp/session";

export const runtime = "nodejs";

const MAX_ACTIVE_KEYS = 10;

const CreateBody = z.object({
  name: z.string().trim().min(1).max(60),
  scopes: z.array(z.enum(["read", "write"])).optional(),
});

export async function GET() {
  const userId = await getCurrentUserId();
  if (!userId) return NextResponse.json({ error: "Non connecté." }, { status: 401 });

  const keys = await data.listApiKeys(userId);
  return NextResponse.json(
    keys
      .filter((k) => !k.revokedAt)
      .map(({ id, name, prefix, scopes, lastUsedAt, createdAt }) => ({
        id, name, prefix, scopes, lastUsedAt, createdAt,
      }))
  );
}

export async function POST(req: Request) {
  const userId = await getCurrentUserId();
  if (!userId) return NextResponse.json({ error: "Non connecté." }, { status: 401 });

  const parsed = CreateBody.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Donne un nom à ta clé (60 caractères max)." }, { status: 400 });
  }

  const active = (await data.listApiKeys(userId)).filter((k) => !k.revokedAt);
  if (active.length >= MAX_ACTIVE_KEYS) {
    return NextResponse.json(
      { error: `Limite de ${MAX_ACTIVE_KEYS} clés atteinte. Révoque une clé avant d'en créer une.` },
      { status: 400 }
    );
  }

  const { key, prefix, hash } = generateApiKey();
  const record = await data.insertApiKey({
    userId,
    name: parsed.data.name,
    prefix,
    hash,
    scopes: parseScopes(parsed.data.scopes),
    lastUsedAt: null,
    revokedAt: null,
  });

  return NextResponse.json(
    { id: record.id, name: record.name, prefix, scopes: record.scopes, key },
    { status: 201 }
  );
}
