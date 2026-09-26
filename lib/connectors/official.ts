import { safeUrl } from "@/lib/projects/types";

const HOSTS: Record<string, string[]> = {
  notion: ["notion.so", "notion.site"],
  figma: ["figma.com"],
  github: ["github.com"],
  supabase: ["supabase.co", "supabase.com"],
  canva: ["canva.com"],
  "google-drive": ["drive.google.com", "docs.google.com"],
  tiktok: ["tiktok.com"],
  instagram: ["instagram.com"],
  linkedin: ["linkedin.com"],
  gamma: ["gamma.app"],
  gmail: ["mail.google.com", "gmail.com"],
};

function hostOk(host: string, allowed: string[]) {
  const h = host.replace(/^www\./, "");
  return allowed.some((a) => h === a || h.endsWith(`.${a}`));
}

export function officialUrl(toolId: string, raw: string) {
  const url = safeUrl(raw.trim());
  if (!url) return null;
  const allowed = HOSTS[toolId];
  if (!allowed) return url;
  try {
    return hostOk(new URL(url).hostname, allowed) ? url : null;
  } catch {
    return null;
  }
}

/** @handle ou URL officielle → URL canonique. */
export function officialProfile(toolId: string, raw: string) {
  const v = raw.trim();
  const map: Record<string, (h: string) => string> = {
    tiktok: (h) => `https://www.tiktok.com/@${h}`,
    instagram: (h) => `https://www.instagram.com/${h}`,
    linkedin: (h) => `https://www.linkedin.com/in/${h}`,
  };
  const toUrl = map[toolId];
  if (toUrl && /^@?[a-zA-Z0-9._-]{2,80}$/.test(v)) {
    return officialUrl(toolId, toUrl(v.replace(/^@/, "")));
  }
  return officialUrl(toolId, v);
}

export function isStripeKey(raw: string) {
  return /^(sk|rk)_(test|live)_[a-zA-Z0-9]{16,}$/.test(raw.trim());
}

export function stripeHint(key: string) {
  const k = key.trim();
  return `${k.slice(0, 7)}…${k.slice(-4)}`;
}

export async function verifyStripeAccount(key: string) {
  const res = await fetch("https://api.stripe.com/v1/account", {
    headers: { Authorization: `Bearer ${key.trim()}` },
    cache: "no-store",
  });
  if (!res.ok) return null;
  const json = (await res.json()) as {
    id?: string;
    business_profile?: { name?: string | null };
    settings?: { dashboard?: { display_name?: string | null } };
    livemode?: boolean;
  };
  if (!json.id) return null;
  const name =
    json.business_profile?.name ||
    json.settings?.dashboard?.display_name ||
    json.id;
  return {
    id: json.id,
    name,
    live: Boolean(json.livemode),
  };
}

export function isEmail(raw: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(raw.trim());
}
