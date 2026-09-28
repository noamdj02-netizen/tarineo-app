const frInt = new Intl.NumberFormat("fr-FR");
const frOne = new Intl.NumberFormat("fr-FR", { maximumFractionDigits: 1 });
const frWhen = new Intl.DateTimeFormat("fr-FR", {
  day: "numeric",
  month: "short",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
});
const frClock = new Intl.DateTimeFormat("fr-FR", { hour: "2-digit", minute: "2-digit", second: "2-digit" });

export function n(value: number) {
  return frInt.format(Math.round(value));
}

export function pct(value: number, digits = 1) {
  const fmt =
    digits === 1
      ? frOne
      : new Intl.NumberFormat("fr-FR", { maximumFractionDigits: digits });
  return `${fmt.format(value)}%`;
}

export function eur(value: number) {
  return `${frInt.format(Math.round(value))}€`;
}

export function delta(current: number, previous: number, kind: "pct" | "pp" | "min" = "pct") {
  if (kind === "min") {
    const diff = Math.round(current - previous);
    const sign = diff > 0 ? "+" : "";
    return { text: `${sign}${formatDuration(Math.abs(diff) * 1000)}`, up: diff > 0, down: diff < 0 };
  }
  if (previous === 0 && current === 0) return { text: "—", up: false, down: false };
  if (kind === "pp") {
    const diff = current - previous;
    const sign = diff > 0 ? "+" : "";
    return { text: `${sign}${frOne.format(diff)} pt`, up: diff > 0, down: diff < 0 };
  }
  if (previous === 0) return { text: "nouveau", up: current > 0, down: false };
  const diff = ((current - previous) / previous) * 100;
  const sign = diff > 0 ? "+" : "";
  return { text: `${sign}${frOne.format(diff)}%`, up: diff > 0, down: diff < 0 };
}

export function formatDuration(ms: number) {
  const total = Math.max(0, Math.round(ms / 1000));
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  if (h) return `${h}h${String(m).padStart(2, "0")}`;
  if (m) return `${m}m${String(s).padStart(2, "0")}`;
  return `${s}s`;
}

export function formatWhen(iso: string) {
  return frWhen.format(new Date(iso));
}

export function formatClock(iso: string) {
  return frClock.format(new Date(iso));
}

export function shortId(id: string) {
  return `user_${id.replace(/-/g, "").slice(0, 4)}`;
}
