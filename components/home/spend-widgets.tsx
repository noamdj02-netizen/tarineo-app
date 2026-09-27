import { SupplierLogo } from "@/components/site/supplier-logo";
import { R } from "@/lib/routes";
import { euroInt } from "@/lib/site/tarineo";
import Link from "next/link";

export function YearSpendWidget({
  months,
}: {
  months: { key: string; label: string; amount: number }[];
}) {
  const max = Math.max(...months.map((m) => m.amount), 1);
  const total = months.reduce((s, m) => s + m.amount, 0);
  return (
    <section className="card-soft p-4">
      <div className="mb-3 flex items-center justify-between">
        <p className="mono-label">{"/ 12 mois ///"}</p>
        <Link href={R.achats} className="text-[12.5px] underline underline-offset-2">
          Achats
        </Link>
      </div>
      <p className="mb-3 font-display text-[22px] font-semibold tabular-nums">{euroInt(total)} HT</p>
      <div className="flex h-24 items-end gap-1">
        {months.map((m) => (
          <div key={m.key} className="flex min-w-0 flex-1 flex-col items-center gap-1">
            <div
              className="w-full rounded-t-sm bg-brand-orange/80"
              style={{ height: `${Math.max(4, (m.amount / max) * 100)}%` }}
              title={`${m.label} · ${euroInt(m.amount)}`}
            />
            <span className="truncate text-[9px] text-muted-foreground">{m.label}</span>
          </div>
        ))}
      </div>
    </section>
  );
}

export function EnseignesWidget({
  rows,
}: {
  rows: { label: string; amount: number }[];
}) {
  const max = Math.max(...rows.map((r) => r.amount), 1);
  return (
    <section className="card-soft p-4">
      <div className="mb-3 flex items-center justify-between">
        <p className="mono-label">{"/ Enseignes ///"}</p>
        <Link href={R.fournisseurs} className="text-[12.5px] underline underline-offset-2">
          Tous
        </Link>
      </div>
      {rows.length ? (
        <ul className="grid gap-2">
          {rows.slice(0, 5).map((r) => (
            <li key={r.label} className="flex items-center gap-2">
              <SupplierLogo name={r.label} size={24} />
              <span className="min-w-0 flex-1 truncate text-[13.5px]">{r.label}</span>
              <span className="tabular-nums text-[13px]">{euroInt(r.amount)}</span>
              <span
                className="hidden h-1.5 w-16 overflow-hidden rounded-full bg-surface-2 sm:block"
                aria-hidden
              >
                <span
                  className="block h-full rounded-full bg-brand-orange"
                  style={{ width: `${(r.amount / max) * 100}%` }}
                />
              </span>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-[13.5px] text-muted-foreground">Déposez un devis pour voir les volumes.</p>
      )}
    </section>
  );
}
