import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/auth";
import { extraireMetaSite } from "@/lib/extraireMetaSite";

const schema = z.object({
  url: z.string().trim().url("URL invalide."),
});

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ erreur: "Non authentifié." }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ erreur: parsed.error.issues[0]?.message ?? "URL invalide." }, { status: 400 });
  }

  let pageUrl = parsed.data.url;
  if (!/^https?:\/\//i.test(pageUrl)) {
    pageUrl = `https://${pageUrl}`;
  }

  try {
    const host = new URL(pageUrl).hostname;
    if (host === "localhost" || host.endsWith(".local")) {
      return NextResponse.json({ erreur: "URL non autorisée." }, { status: 400 });
    }

    const res = await fetch(pageUrl, {
      headers: { "User-Agent": "TarineoBot/1.0 (+https://tarineo.fr)" },
      signal: AbortSignal.timeout(8000),
      redirect: "follow",
    });

    if (!res.ok) {
      return NextResponse.json({ erreur: "Impossible d'accéder à ce site." }, { status: 422 });
    }

    const html = await res.text();
    if (html.length > 500_000) {
      return NextResponse.json({ erreur: "Page trop volumineuse." }, { status: 422 });
    }

    const { nom, logoUrl } = extraireMetaSite(html, pageUrl);
    if (!nom && !logoUrl) {
      return NextResponse.json(
        { erreur: "Aucune information trouvée sur cette page. Saisissez le nom à la main." },
        { status: 422 }
      );
    }

    return NextResponse.json({ nom, logoUrl, url: pageUrl });
  } catch {
    return NextResponse.json({ erreur: "Impossible de récupérer ce site. Vérifiez l'URL." }, { status: 422 });
  }
}
