import { parseMindmap } from "./mindmap";

/** Libs officielles MIT : https://libraries.excalidraw.com/libraries.json */
export const EXCALIDRAW_LIB_SOURCES = [
  "youritjang/software-architecture.excalidrawlib",
  "niknm/systemdesignicons.excalidrawlib",
  "xxxdeveloper/icons.excalidrawlib",
] as const;

export const ICON_KEYS = [
  "browser",
  "mobile",
  "database",
  "api",
  "auth",
  "server",
  "cloud",
  "cache",
  "queue",
  "user",
  "mail",
  "payment",
  "stripe",
  "file",
  "lock",
  "chart",
  "search",
  "calendar",
  "chat",
  "image",
  "cart",
  "webhook",
  "settings",
  "check",
  "alert",
  "github",
  "landing",
  "notification",
] as const;

export type IconKey = (typeof ICON_KEYS)[number];

const ALIASES: Record<IconKey, string[]> = {
  browser: ["browser", "web", "chrome", "navigateur"],
  mobile: ["mobile", "phone", "smartphone", "device"],
  database: ["database", "db", "postgres", "sql"],
  api: ["api", "microservice", "service", "backend"],
  auth: ["auth", "login", "identity"],
  server: ["server", "compute", "host"],
  cloud: ["cloud", "cdn"],
  cache: ["cache", "redis"],
  queue: ["queue", "bus", "event", "pipeline"],
  user: ["user", "person", "people", "avatar"],
  mail: ["mail", "email", "inbox"],
  payment: ["payment", "pay", "checkout"],
  stripe: ["stripe", "card"],
  file: ["file", "document", "docs", "code"],
  lock: ["lock", "secure", "shield"],
  chart: ["chart", "graph", "analytics"],
  search: ["search", "find"],
  calendar: ["calendar", "agenda"],
  chat: ["chat", "message", "comment"],
  image: ["image", "photo", "media"],
  cart: ["cart", "shop"],
  webhook: ["webhook", "hook"],
  settings: ["settings", "gear", "config"],
  check: ["check", "success", "done"],
  alert: ["alert", "warning", "error"],
  github: ["github", "git"],
  landing: ["landing", "page", "hero"],
  notification: ["notification", "bell"],
};

export function isIconKey(v: string): v is IconKey {
  return (ICON_KEYS as readonly string[]).includes(v);
}

export function libCdnUrl(source: string) {
  return `https://cdn.jsdelivr.net/gh/excalidraw/excalidraw-libraries@master/libraries/${source}`;
}

export function mermaidNodes(src: string): { id: string; label: string }[] {
  if (/^\s*mindmap\b/m.test(src)) {
    const tree = parseMindmap(src);
    if (!tree) return [];
    const out: { id: string; label: string }[] = [];
    const walk = (n: { id: string; label: string; kids: typeof tree.kids }) => {
      out.push({ id: n.id, label: n.label });
      n.kids.forEach(walk);
    };
    walk(tree);
    return out;
  }
  const seen = new Set<string>();
  const out: { id: string; label: string }[] = [];
  const quoted = /([A-Za-z][\w]*)\s*(?:\[\(|\[\[|\[|\(\(|\(|\{)\s*"([^"]+)"/g;
  for (const m of src.matchAll(quoted)) {
    if (seen.has(m[1])) continue;
    seen.add(m[1]);
    out.push({ id: m[1], label: m[2] });
  }
  const cls = /^class\s+(\w+)/gm;
  for (const m of src.matchAll(cls)) {
    if (seen.has(m[1])) continue;
    seen.add(m[1]);
    out.push({ id: m[1], label: m[1] });
  }
  return out;
}

export function parseIconMap(raw: string): Record<string, IconKey> {
  const json = raw.match(/\{[\s\S]*\}/)?.[0];
  if (!json) return {};
  try {
    const obj = JSON.parse(json) as Record<string, unknown>;
    const out: Record<string, IconKey> = {};
    for (const [k, v] of Object.entries(obj)) {
      if (typeof v === "string" && isIconKey(v)) out[k] = v;
    }
    return out;
  } catch {
    return {};
  }
}

export function itemMatchesKey(name: string | undefined, key: IconKey) {
  const n = (name ?? "").toLowerCase();
  if (!n) return false;
  return ALIASES[key].some((a) => n.includes(a));
}
