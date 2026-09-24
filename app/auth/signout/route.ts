import { NextResponse, type NextRequest } from "next/server";
import {
  clearRequireLoginCookie,
  setRequireLoginCookie,
} from "@/lib/auth/require-login-cookie";
import { createClient } from "@/lib/supabase/server";
import { isOpenAccess } from "@/lib/supabase/config";

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  await supabase.auth.signOut({ scope: "global" });

  const url = new URL("/login", request.url);
  url.searchParams.set("signed_out", "1");
  const response = NextResponse.redirect(url, { status: 303 });

  if (isOpenAccess()) {
    setRequireLoginCookie(response);
  } else {
    clearRequireLoginCookie(response);
  }

  return response;
}
