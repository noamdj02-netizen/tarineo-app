import { NextResponse, type NextRequest } from "next/server";
import { isDeployedRuntime } from "@/lib/runtime-config";
import { updateSession } from "@/lib/supabase/middleware";

const GHOST_APIS = ["/api/mcp", "/api/schemas/generate", "/api/projects/seo"];

export async function middleware(request: NextRequest) {
  const host = request.headers.get("host")?.split(":")[0];
  const proto = request.headers.get("x-forwarded-proto");
  const pathname = request.nextUrl.pathname;

  if (isDeployedRuntime() && GHOST_APIS.some((p) => pathname === p || pathname.startsWith(`${p}/`))) {
    return new NextResponse("Not Found", { status: 404 });
  }

  if (host === "navpit.com") {
    const url = request.nextUrl.clone();
    url.protocol = "https:";
    url.host = "www.navpit.com";
    return NextResponse.redirect(url, 308);
  }

  if (
    process.env.NODE_ENV === "production" &&
    host &&
    (host === "www.navpit.com" || host === "app.tarineo.com" || host === "www.tarineo.fr" || host.endsWith(".vercel.app")) &&
    proto === "http"
  ) {
    const url = request.nextUrl.clone();
    url.protocol = "https:";
    return NextResponse.redirect(url, 308);
  }

  return updateSession(request);
}

export const config = {
  // Tout sauf les fichiers statiques, les icônes, le manifest et le service worker.
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|icons/|manifest.webmanifest|sw.js|llms.txt|google0f1046d02ef1bfa1.html|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|txt|xml|html|mp4|webm|m4v|mp3)$).*)",
  ],
};
