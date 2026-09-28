/**
 * Allowlist d’origines pour les routes assistant (et schémas).
 * Jamais `*`. Jamais Navpit. Origin malformé → refus.
 */
export type OriginDecision = { ok: true; via: "origin" | "host" } | { ok: false; reason: "missing" | "malformed" | "denied" };

function originOf(url: string): string | null {
  try {
    return new URL(url).origin;
  } catch {
    return null;
  }
}

function hostToOrigin(host: string, proto: string): string | null {
  const raw = host.trim().split(",")[0]?.trim();
  if (!raw) return null;
  const scheme = proto === "http" ? "http" : "https";
  return originOf(`${scheme}://${raw}`);
}

export function allowedOrigins(env: NodeJS.ProcessEnv = process.env): Set<string> {
  const set = new Set<string>();
  set.add("https://app.tarineo.com");
  const app = env.NEXT_PUBLIC_APP_URL?.trim();
  if (app) {
    const o = originOf(app.startsWith("http") ? app : `https://${app}`);
    if (o && !/navpit/i.test(o)) set.add(o);
  }
  const vercel = env.VERCEL_ENV;
  const deployed = vercel === "production" || vercel === "preview" || env.NODE_ENV === "production";
  if (!deployed) {
    set.add("http://localhost:3000");
    set.add("http://127.0.0.1:3000");
  }
  if (vercel === "preview" && env.VERCEL_URL?.trim()) {
    const preview = originOf(`https://${env.VERCEL_URL.trim()}`);
    if (preview && !/navpit/i.test(preview)) set.add(preview);
  }
  return set;
}

function protoFrom(request: Request) {
  const xf = request.headers.get("x-forwarded-proto")?.split(",")[0]?.trim();
  if (xf === "http" || xf === "https") return xf;
  try {
    return new URL(request.url).protocol.replace(":", "") === "http" ? "http" : "https";
  } catch {
    return "https";
  }
}

/** true si la requête vient d’un front TARINEO légitime. */
export function isAllowedOrigin(request: Request, env: NodeJS.ProcessEnv = process.env): OriginDecision {
  const allow = allowedOrigins(env);
  const origin = request.headers.get("origin")?.trim() ?? "";
  if (origin) {
    const parsed = originOf(origin);
    if (!parsed) return { ok: false, reason: "malformed" };
    if (/navpit/i.test(parsed)) return { ok: false, reason: "denied" };
    if (allow.has(parsed)) return { ok: true, via: "origin" };
    return { ok: false, reason: "denied" };
  }

  const site = (request.headers.get("sec-fetch-site") ?? "").toLowerCase();
  if (site && site !== "same-origin" && site !== "none") {
    return { ok: false, reason: "denied" };
  }
  const host = request.headers.get("host") ?? "";
  const fromHost = hostToOrigin(host, protoFrom(request));
  if (fromHost && allow.has(fromHost)) return { ok: true, via: "host" };
  return { ok: false, reason: "missing" };
}
