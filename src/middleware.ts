import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { ipDepuisRequete, verifierRateLimit } from "@/lib/rateLimit";

const LIMITES: { prefix: string; limite: number; fenetreMs: number }[] = [
  { prefix: "/api/auth", limite: 30, fenetreMs: 60_000 },
  { prefix: "/api/stripe/webhook", limite: 200, fenetreMs: 60_000 },
  { prefix: "/api/compte/export-donnees", limite: 5, fenetreMs: 60 * 60_000 },
];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const ip = ipDepuisRequete(request.headers);

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

  // Redirection HTTP → HTTPS en prod (hors localhost / IP privées de dév).
  const proto = request.headers.get("x-forwarded-proto");
  const host = request.headers.get("host") ?? "";
  const estLocal =
    host.startsWith("localhost") ||
    host.startsWith("127.0.0.1") ||
    /^192\.168\./.test(host) ||
    /^10\./.test(host) ||
    /^172\.(1[6-9]|2\d|3[0-1])\./.test(host);
  if (proto === "http" && !estLocal) {
    const url = request.nextUrl.clone();
    url.protocol = "https:";
    return NextResponse.redirect(url, 308);
  }

  const response = NextResponse.next({
    request: { headers: requestHeaders },
  });
  response.headers.set(
    "Strict-Transport-Security",
    "max-age=63072000; includeSubDomains; preload",
  );
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  response.headers.set("Permissions-Policy", "camera=(), microphone=(), geolocation=()");
  return response;
}

export const config = {
  matcher: ["/api/:path*", "/((?!_next/static|_next/image|favicon.ico|.*\\..*).*)"],
};
