"use server";

import { cookies } from "next/headers";
import { REQUIRE_LOGIN_COOKIE } from "@/lib/auth/require-login-cookie";
import { settleAuthSession } from "@/lib/auth/settle-session";
import { VERIFIED_COOKIE, type VerifiedKind } from "@/lib/auth/verified";
import { getSiteUrl } from "@/lib/site-url";
import { createClient } from "@/lib/supabase/server";

/** La session est déjà posée dans le navigateur : ouvre la bonne page, sans détour. */
export async function continueAfterAuth(next: string, kind: VerifiedKind | null) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false as const };
  const path = await settleAuthSession(supabase, getSiteUrl(), next);
  const jar = await cookies();
  jar.set(REQUIRE_LOGIN_COOKIE, "", { path: "/", maxAge: 0 });
  if (kind) {
    jar.set(VERIFIED_COOKIE, kind, { path: "/", maxAge: 120, sameSite: "lax" });
  }
  return { ok: true as const, path };
}
