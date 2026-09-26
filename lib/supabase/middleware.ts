import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { enforceProTrialExpiry } from "@/lib/billing/trial";
import { hasRequireLoginCookie, REQUIRE_LOGIN_COOKIE } from "@/lib/auth/require-login-cookie";
import { isOpenAccess, isSupabaseConfigured } from "./config";
import type { Database } from "./types";

/** Pages accessibles sans compte (site public, connexion, webhooks). */
const PUBLIC_PATHS = [
  "/login",
  "/auth",
  "/inscription",
  "/mot-de-passe-oublie",
  "/nouveau-mot-de-passe",
  "/prix",
  "/mentions-legales",
  "/cgv",
  "/confidentialite",
  "/api/billing/webhook",
];
/** Pages de connexion : un visiteur déjà connecté part directement dans l'app. */
const AUTH_PAGES = ["/login", "/inscription"];

/** Fichiers SEO / crawlers : jamais derrière la connexion. */
const CRAWLER_PATHS = new Set([
  "/robots.txt",
  "/sitemap.xml",
  "/llms.txt",
  "/google0f1046d02ef1bfa1.html",
]);

/** Rafraîchit la session et renvoie vers /login si personne n'est connecté. */
export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request });

  if (CRAWLER_PATHS.has(request.nextUrl.pathname)) {
    return response;
  }

  if (!isSupabaseConfigured()) {
    if (process.env.NODE_ENV === "production") {
      return new NextResponse("Supabase n'est pas configuré.", { status: 500 });
    }
    return response;
  }

  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  let {
    data: { user },
  } = await supabase.auth.getUser();

  if (user && !request.nextUrl.pathname.startsWith("/auth/")) {
    await enforceProTrialExpiry(supabase);
    const refreshed = await supabase.auth.getUser();
    user = refreshed.data.user;
  }

  const requireLogin = hasRequireLoginCookie(request.cookies.get(REQUIRE_LOGIN_COOKIE)?.value);

  // Accès libre : compte seed seulement sans session et sans avoir cliqué « Se déconnecter ».
  const openAccessBypass = isOpenAccess() && !user && !requireLogin;

  if (openAccessBypass) {
    const path = request.nextUrl.pathname;
    const adminLogin = path === "/login" && request.nextUrl.searchParams.get("next") === "/admin";
    if (adminLogin) return response;
    if (AUTH_PAGES.includes(path)) {
      const url = new URL("/accueil", request.url);
      const q = request.nextUrl.searchParams.get("q");
      if (q) url.searchParams.set("ask", q.slice(0, 500));
      return NextResponse.redirect(url);
    }
    return response;
  }

  const { pathname } = request.nextUrl;
  const isPublic =
    pathname === "/" || PUBLIC_PATHS.some((p) => pathname === p || pathname.startsWith(p + "/"));

  if (!user && !isPublic) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.search = `?next=${encodeURIComponent(pathname)}`;
    return NextResponse.redirect(url);
  }

  const meta = user?.user_metadata ?? {};
  const needsOnboarding = meta.onboarding_required === true && meta.onboarding_done !== true;

  if (user && AUTH_PAGES.includes(pathname)) {
    const plan = request.nextUrl.searchParams.get("plan");
    const url = request.nextUrl.clone();
    url.search = "";
    if (needsOnboarding) {
      url.pathname = "/onboarding";
      if (plan) {
        const next = new URLSearchParams({ plan });
        const interval = request.nextUrl.searchParams.get("interval");
        if (interval) next.set("interval", interval);
        url.searchParams.set("next", `/abonnement?${next}`);
      }
      return NextResponse.redirect(url);
    }
    if (plan) {
      url.pathname = "/abonnement";
      url.searchParams.set("plan", plan);
      const interval = request.nextUrl.searchParams.get("interval");
      if (interval) url.searchParams.set("interval", interval);
    } else {
      url.pathname = "/accueil";
      const q = request.nextUrl.searchParams.get("q");
      if (q) url.searchParams.set("ask", q.slice(0, 500));
    }
    return NextResponse.redirect(url);
  }

  if (
    user &&
    needsOnboarding &&
    !pathname.startsWith("/admin") &&
    !pathname.startsWith("/onboarding") &&
    !pathname.startsWith("/auth")
  ) {
    const url = request.nextUrl.clone();
    url.pathname = "/onboarding";
    url.search = "";
    if (pathname.startsWith("/abonnement") && request.nextUrl.search) {
      url.searchParams.set("next", `${pathname}${request.nextUrl.search}`);
    }
    return NextResponse.redirect(url);
  }

  if (user && !needsOnboarding && pathname.startsWith("/onboarding")) {
    const url = request.nextUrl.clone();
    url.pathname = "/accueil";
    url.search = "";
    return NextResponse.redirect(url);
  }

  return response;
}
