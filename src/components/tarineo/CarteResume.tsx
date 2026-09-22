export function CarteResume({
  label,
  valeur,
  hint,
  accent,
}: {
  label: string;
  valeur: string;
  hint?: string;
  accent?: boolean;
}) {
  return (
    <div className="rounded-[16px] bg-secondary px-4 py-3">
      <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className={`mt-1 text-lg font-semibold ${accent ? "text-[#D64545]" : "text-foreground"}`}>{valeur}</p>
      {hint && <p className="mt-0.5 text-xs text-muted-foreground">{hint}</p>}
    </div>
  );
}
