import { euroInt } from "@/lib/site/tarineo";

export function TopProducts({
  items,
}: {
  items: { id: string; name: string; amountHt: number; qty: number }[];
}) {
  if (!items.length) {
    return <p className="p-4 text-[13px] text-muted-foreground">Pas encore d’achats enregistrés.</p>;
  }
  return (
    <ol className="divide-y divide-line">
      {items.map((item, i) => (
        <li key={item.id} className="flex items-center gap-3 px-4 py-3">
          <span className="font-display text-[15px] font-semibold tabular-nums text-muted-foreground">{i + 1}</span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-[14px] font-medium text-ink">{item.name}</p>
            <p className="text-[12px] text-muted-foreground">{item.qty} unité(s)</p>
          </div>
          <p className="shrink-0 font-medium tabular-nums text-ink">{euroInt(item.amountHt)}</p>
        </li>
      ))}
    </ol>
  );
}
