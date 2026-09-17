import { Badge } from "@/components/ui/badge";
import type { OpportuniteFournisseur } from "@/lib/opportunitesFournisseur";

export function OpportunitesFournisseur({ items }: { items: OpportuniteFournisseur[] }) {
  if (items.length === 0) return null;

  return (
    <ul className="space-y-3">
      {items.map((item) => (
        <li key={item.id} className="rounded-[16px] border border-[#EEF0F2] bg-[#FAFBFC] p-4">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <p className="font-medium text-foreground">{item.titre}</p>
            {item.badge && (
              <Badge variant={item.badge === "Alerte prix" ? "destructive" : "secondary"} className="shrink-0">
                {item.badge}
              </Badge>
            )}
          </div>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{item.description}</p>
        </li>
      ))}
    </ul>
  );
}
