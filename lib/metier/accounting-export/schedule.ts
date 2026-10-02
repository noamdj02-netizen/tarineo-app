import type { ExportFrequency } from "@/lib/metier/accounting-export/types";

export function computeNextRun(input: {
  frequency: ExportFrequency;
  dayOfMonth: number;
  from?: Date;
}): string {
  const day = Math.min(28, Math.max(1, input.dayOfMonth));
  const from = input.from ?? new Date();
  const d = new Date(from);
  d.setHours(8, 0, 0, 0);
  if (d.getDate() >= day) {
    d.setMonth(d.getMonth() + 1);
  }
  d.setDate(day);
  d.setHours(8, 0, 0, 0);
  return d.toISOString();
}
