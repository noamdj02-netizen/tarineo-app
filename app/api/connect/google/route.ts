import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { integrationsHubUrl } from "@/lib/integrations/hub";
import { safeNext } from "@/lib/safe-next";
import { createClient } from "@/lib/supabase/server";

const SCOPES: Record<string, string> = {
  gmail: "email profile https://www.googleapis.com/auth/gmail.send",
  drive: "email profile https://www.googleapis.com/auth/drive.file",
};

export async function GET(request: Request) {
  const url = new URL(request.url);
  const tool = url.searchParams.get("tools") === "drive" ? "drive" : "gmail";
  const bound = tool === "drive" ? "drive" : "gmail";
  const defaultReturn = integrationsHubUrl({ bound });
  const returnParam = url.searchParams.get("return");
  const db = await getDb();
  if (!db) {
    return NextResponse.redirect(new URL("/login?next=/automatisations", url.origin));
  }

  const supabase = await createClient();
  const next = safeNext(returnParam ?? defaultReturn, defaultReturn);
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: `${url.origin}/auth/callback?next=${encodeURIComponent(next)}`,
      queryParams: { access_type: "offline", prompt: "consent" },
      scopes: SCOPES[tool],
    },
  });
  if (error || !data.url) {
    return NextResponse.redirect(
      new URL(integrationsHubUrl({ erreur: "google" }), url.origin),
    );
  }
  return NextResponse.redirect(data.url);
}
