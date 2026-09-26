export function parseHex(hex: string, fallback: string) {
  return /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(hex) ? hex : fallback;
}

export function luminance(hex: string) {
  const raw = parseHex(hex, "#111111").slice(1);
  const full = raw.length === 3 ? raw.split("").map((c) => c + c).join("") : raw;
  const r = parseInt(full.slice(0, 2), 16);
  const g = parseInt(full.slice(2, 4), 16);
  const b = parseInt(full.slice(4, 6), 16);
  return (r * 299 + g * 587 + b * 114) / 1000;
}

export function isLightHex(hex: string) {
  return luminance(hex) > 158;
}

export function fontStack(name: string) {
  const n = (name || "").toLowerCase();
  if (n.includes("instrument")) return "var(--font-instrument-serif), Georgia, serif";
  if (n.includes("space")) return "var(--font-space-grotesk), ui-sans-serif, system-ui, sans-serif";
  if (n.includes("jetbrains") || n.includes("mono")) {
    return "var(--font-jetbrains), ui-monospace, Menlo, monospace";
  }
  return "var(--font-inter-tight), ui-sans-serif, system-ui, sans-serif";
}

export function unsplash(id: string, w = 1400) {
  return `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${w}&q=72`;
}
