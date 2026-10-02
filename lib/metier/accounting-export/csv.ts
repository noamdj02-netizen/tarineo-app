import type { ExportRow } from "@/lib/metier/accounting-export/rows";

export function buildCsvString(rows: ExportRow[]): string {
  if (!rows.length) return "";
  const cols = Object.keys(rows[0]);
  const lines = [cols.join(";"), ...rows.map((r) => cols.map((c) => String(r[c]).replace(/;/g, ",")).join(";"))];
  return lines.join("\n");
}

export function buildCsvBuffer(rows: ExportRow[]): Buffer {
  return Buffer.from(buildCsvString(rows), "utf-8");
}
