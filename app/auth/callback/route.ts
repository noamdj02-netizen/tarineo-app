import type { EmailOtpType } from "@supabase/supabase-js";
import { NextResponse, type NextRequest } from "next/server";
import { settleAuthSession } from "@/lib/auth/settle-session";
import { clearRequireLoginCookie } from "@/lib/auth/require-login-cookie";
import { kindFromEmailType, VERIFIED_COOKIE, verifiedKind } from "@/lib/auth/verified";
import { safeNext } from "@/lib/safe-next";
import { createClient } from "@/lib/supabase/server";

/**
 * Arrivée depuis l’email.
 * ?token_hash=…&type=… (lien Navpit), ?code=… (Google / PKCE),
 * ou session déjà ouverte après un code saisi sur place.
 */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = request.nextUrl;
  const next = safeNext(searchParams.get("next"));
  const code = searchParams.get("code");
  const tokenHash = searchParams.get("token_hash");
  const type = searchParams.get("type") as EmailOtpType | null;

  const supabase = await createClient();
  let kind = kindFromEmailType(type);

  if (code || (tokenHash && type)) {
    const { error } = code
      ? await supabase.auth.exchangeCodeForSession(code)
      : await supabase.auth.verifyOtp({ token_hash: tokenHash!, type: type! });
    if (error) return NextResponse.redirect(`${origin}/login?error=lien`);
  } else {
    const {
      data: { user: existing },
    } = await supabase.auth.getUser();
    if (!existing) {
      // 302 jetterait le fragment (#access_token) des anciens liens Supabase.
      const resume = `/auth/session?next=${encodeURIComponent(next)}`;
      const html = `<!doctype html><meta charset="utf-8"><title>Connexion</title><p style="font:15px/1.4 system-ui;color:#666;text-align:center;margin-top:30vh">Connexion…</p><script>location.replace(${JSON.stringify(resume)}+location.hash)</script>`;
      return new NextResponse(html, {
        headers: { "content-type": "text/html; charset=utf-8", "cache-control": "no-store" },
      });
    }
    kind = verifiedKind(searchParams.get("verified"));
  }

  const path = await settleAuthSession(supabase, origin, next);
  return redirectWithSession(new URL(path, origin), kind);
}

function redirectWithSession(url: URL, kind: ReturnType<typeof verifiedKind>) {
  const response = NextResponse.redirect(url);
  clearRequireLoginCookie(response);
  if (kind) {
    response.cookies.set(VERIFIED_COOKIE, kind, { path: "/", maxAge: 120, sameSite: "lax" });
  }
  return response;
}
