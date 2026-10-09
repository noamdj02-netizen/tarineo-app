import {
  extractLandingDemoDocument,
  LandingExtractError,
  landingExtractUserMessage,
} from "@/lib/site/landing-quote-extract.server";
import {
  checkExtractRateLimit,
  clientIpFromHeaders,
} from "@/lib/site/landing-demo-rate-limit";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(req: Request) {
  const rl = checkExtractRateLimit(req.headers.get("cookie"), clientIpFromHeaders(req.headers));
  if (!rl.allowed) {
    return Response.json(
      { ok: false, code: "rate_limited", message: landingExtractUserMessage("rate_limited") },
      { status: 429 },
    );
  }

  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    return Response.json(
      { ok: false, code: "invalid_type", message: landingExtractUserMessage("invalid_type") },
      { status: 400 },
    );
  }

  const file = form.get("file");
  if (!(file instanceof File) || file.size === 0) {
    return Response.json(
      { ok: false, code: "empty", message: landingExtractUserMessage("empty") },
      { status: 400 },
    );
  }

  const buffer = Buffer.from(await file.arrayBuffer());

  try {
    const extraction = await extractLandingDemoDocument({
      fileName: file.name || "document.pdf",
      declaredMime: file.type || "application/octet-stream",
      buffer,
    });
    const headers: Record<string, string> = { "Content-Type": "application/json" };
    if (rl.setCookie) headers["Set-Cookie"] = rl.setCookie;
    return Response.json({ ok: true, extraction }, { headers });
  } catch (err) {
    const code = err instanceof LandingExtractError ? err.code : "server";
    const message =
      err instanceof LandingExtractError ? err.message : landingExtractUserMessage("server");
    const status = code === "rate_limited" ? 429 : code === "server" ? 500 : 422;
    const headers: Record<string, string> = { "Content-Type": "application/json" };
    if (rl.setCookie) headers["Set-Cookie"] = rl.setCookie;
    return Response.json({ ok: false, code, message }, { status, headers });
  }
}
