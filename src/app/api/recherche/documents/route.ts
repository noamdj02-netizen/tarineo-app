import { NextResponse } from "next/server";
import { z } from "zod";
import { getSession } from "@/lib/session";
import { verifierRateLimit } from "@/lib/rateLimit";
import { suggererRechercheDocuments } from "@/lib/suggestionsRecherche";

const schema = z.object({
  q: z.string().trim().min(2).max(80),
});

export async function GET(request: Request) {
  const session = await getSession();
  if (!session?.user?.id) {
    return NextResponse.json({ erreur: "Non autorisé" }, { status: 401 });
  }

  if (!verifierRateLimit(`recherche-doc:${session.user.id}`, 60, 60_000)) {
    return NextResponse.json({ erreur: "Trop de recherches — réessayez dans un instant." }, { status: 429 });
  }

  const q = new URL(request.url).searchParams.get("q");
  const parse = schema.safeParse({ q });
  if (!parse.success) {
    return NextResponse.json({ suggestions: [] });
  }

  const suggestions = await suggererRechercheDocuments(session.user.id, parse.data.q);
  return NextResponse.json({ suggestions });
}
