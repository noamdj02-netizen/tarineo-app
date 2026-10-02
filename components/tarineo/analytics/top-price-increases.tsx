import Link from "next/link";
import { StatusBadge } from "@/components/tarineo/status-badge";
import { R } from "@/lib/routes";
import { euro, signedPct } from "@/lib/site/tarineo";

export function TopPriceIncreases({
  items,
}: {
  items: {
    id: string;
    label: string;
    oldPrice: number;
    newPrice: number;
    pct: number;
    chantierName?: string | null;
    documentId?: string | null;
  }[];
}) {
  if (!items.length) {
    return <p className="p-4 text-[13px] text-muted-foreground">Aucune hausse détectée.</p>;
  }
  return (
    <ul className="divide-y divide-line">
      {items.map((item) => (
        <li key={item.id} className="flex flex-wrap items-center justify-between gap-2 px-4 py-3">
          <div className="min-w-0">
            <p className="truncate text-[14px] font-medium text-ink">{item.label}</p>
            <p className="text-[12px] text-muted-foreground">
              {euro(item.oldPrice)} → {euro(item.newPrice)}
              {item.chantierName ? ` · ${item.chantierName}` : ""}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <StatusBadge label={signedPct(item.pct)} tone="warn" />
            {item.documentId ? (
              <Link href={R.piece(item.documentId)} className="text-[12px] font-medium text-tarineo-orange hover:underline">
                Pièce
              </Link>
            ) : null}
          </div>
        </li>
      ))}
    </ul>
  );
}
