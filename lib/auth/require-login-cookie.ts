import type { NextResponse } from "next/server";

/** Après déconnexion en mode accès libre : exiger une vraie session Supabase. */
export const REQUIRE_LOGIN_COOKIE = "navpit_require_login";

const ONE_YEAR = 60 * 60 * 24 * 365;

export function hasRequireLoginCookie(cookieValue: string | undefined) {
  return cookieValue === "1";
}

export function setRequireLoginCookie(response: NextResponse) {
  response.cookies.set(REQUIRE_LOGIN_COOKIE, "1", {
    path: "/",
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: ONE_YEAR,
  });
}

export function clearRequireLoginCookie(response: NextResponse) {
  response.cookies.set(REQUIRE_LOGIN_COOKIE, "", { path: "/", maxAge: 0 });
}
