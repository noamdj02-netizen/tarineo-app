import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { ipDepuisRequete, verifierRateLimit } from "@/lib/rateLimit";

const LIMITES: { prefix: string; limite: number; fenetreMs: number }[] = [
  { prefix: "/api/auth", limite: 30, fenetreMs: 60_000 },
  { prefix: "/api/stripe/webhook", limite: 200, fenetreMs: 60_000 },
  { prefix: "/api/compte/export-donnees", limite: 5, fenetreMs: 60 * 60_000 },
];

const DOMAINE_CANONIQUE = "app.tarineo.com";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const ip = ipDepuisRequete(request.headers);
  const host = request.headers.get("host") ?? "";

  // Un seul domaine en production : évite les erreurs PKCE (cookies OAuth sur un autre hôte).
  if (
    process.env.NODE_ENV === "production" &&
    host.endsWith(".vercel.app") &&
    host !== DOMAINE_CANONIQUE
  ) {
    const url = request.nextUrl.clone();
    url.protocol = "https:";
    url.host = DOMAINE_CANONIQUE;
    return NextResponse.redirect(url, 308);
  }

  for (const { prefix, limite, fenetreMs } of LIMITES) {
    if (pathname.startsWith(prefix)) {
      if (!verifierRateLimit(`${prefix}:${ip}`, limite, fenetreMs)) {
        return NextResponse.json({ erreur: "Trop de requêtes. Réessayez dans un instant." }, { status: 429 });
      }
      break;
    }
  }

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-pathname", pathname);

  const response = NextResponse.next({
    request: { headers: requestHeaders },
  });
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  response.headers.set("Permissions-Policy", "camera=(), microphone=(), geolocation=()");
  return response;
}

export const config = {
  matcher: ["/api/:path*", "/((?!_next/static|_next/image|favicon.ico|.*\\..*).*)"],
};
