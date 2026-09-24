import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
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
];
/** Pages de connexion : un visiteur déjà connecté part directement dans l'app. */
const AUTH_PAGES = ["/login", "/inscription"];

/** Rafraîchit la session et renvoie vers /login si personne n'est connecté. */
export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request });

  // Supabase pas encore configuré (.env.local vide) : on laisse passer en local
  // pour pouvoir travailler sur le design. En production, les variables sont obligatoires.
  // Accès libre : pas de connexion, la page /login renvoie vers l'accueil.
  if (isOpenAccess()) {
    if (AUTH_PAGES.includes(request.nextUrl.pathname)) {
      const url = new URL("/accueil", request.url);
      const q = request.nextUrl.searchParams.get("q");
      if (q) url.searchParams.set("ask", q.slice(0, 500));
      return NextResponse.redirect(url);
    }
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

  // Ne rien mettre entre createServerClient et getUser (recommandation Supabase).
  const {
    data: { user },
  } = await supabase.auth.getUser();

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

  // Connecté sur /inscription?plan=pro : onboarding d’abord, le plan est conservé.
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

  if (user && needsOnboarding && !pathname.startsWith("/onboarding") && !pathname.startsWith("/auth")) {
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
