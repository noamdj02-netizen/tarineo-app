export function ExportPreviewTable({ rows }: { rows: Record<string, string | number>[] }) {
  if (!rows.length) {
    return <p className="p-4 text-[13px] text-muted-foreground">Aucune ligne pour l’aperçu.</p>;
  }
  const cols = Object.keys(rows[0] ?? {});
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[560px] text-left text-[13px]">
        <thead>
          <tr className="border-b border-line bg-surface-2 text-muted-foreground">
            {cols.map((c) => (
              <th key={c} className="px-3 py-2 font-medium">{c}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i} className="border-b border-line last:border-0">
              {cols.map((c) => (
                <td key={c} className="px-3 py-2 text-ink">{row[c]}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
