import type { DateRangePreset } from "@/components/tarineo/types";
import type { ExportFrequency } from "@/lib/metier/accounting-export/types";

const TZ = "Europe/Paris";

function parisParts(d: Date) {
  const fmt = new Intl.DateTimeFormat("fr-FR", {
    timeZone: TZ,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
  const parts = fmt.formatToParts(d);
  const y = Number(parts.find((p) => p.type === "year")?.value);
  const m = Number(parts.find((p) => p.type === "month")?.value);
  const day = Number(parts.find((p) => p.type === "day")?.value);
  return { y, m, day };
}

function isoDate(y: number, m: number, d: number) {
  return `${y}-${String(m).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
}

function lastDayOfMonth(y: number, m: number) {
  return new Date(Date.UTC(y, m, 0)).getUTCDate();
}

export function previousPeriod(frequency: ExportFrequency, refDate = new Date()) {
  const { y, m } = parisParts(refDate);
  if (frequency === "monthly") {
    let pm = m - 1;
    let py = y;
    if (pm < 1) {
      pm = 12;
      py -= 1;
    }
    const end = lastDayOfMonth(py, pm);
    const start = isoDate(py, pm, 1);
    const endIso = isoDate(py, pm, end);
    const label = new Date(`${start}T12:00:00`).toLocaleDateString("fr-FR", {
      month: "long",
      year: "numeric",
      timeZone: TZ,
    });
    return { start, end: endIso, label: `Mois de ${label}` };
  }
  if (frequency === "quarterly") {
    const q = Math.floor((m - 1) / 3) + 1;
    let pq = q - 1;
    let py = y;
    if (pq < 1) {
      pq = 4;
      py -= 1;
    }
    const startM = (pq - 1) * 3 + 1;
    const endM = startM + 2;
    const end = lastDayOfMonth(py, endM);
    return {
      start: isoDate(py, startM, 1),
      end: isoDate(py, endM, end),
      label: `T${pq} ${py}`,
    };
  }
  const py = y - 1;
  return {
    start: isoDate(py, 1, 1),
    end: isoDate(py, 12, 31),
    label: `Année ${py}`,
  };
}

export function resolveDateRangePreset(preset: DateRangePreset, refDate = new Date()): { start: string; end: string } {
  const { y, m, day } = parisParts(refDate);
  if (preset === "month") {
    const end = lastDayOfMonth(y, m);
    return { start: isoDate(y, m, 1), end: isoDate(y, m, end) };
  }
  if (preset === "quarter") {
    const q = Math.floor((m - 1) / 3) + 1;
    const startM = (q - 1) * 3 + 1;
    const endM = startM + 2;
    const end = lastDayOfMonth(y, endM);
    return { start: isoDate(y, startM, 1), end: isoDate(y, endM, end) };
  }
  if (preset === "year") {
    return { start: isoDate(y, 1, 1), end: isoDate(y, 12, 31) };
  }
  if (preset === "last_year") {
    const py = y - 1;
    return { start: isoDate(py, 1, 1), end: isoDate(py, 12, 31) };
  }
  return { start: "", end: "" };
}
