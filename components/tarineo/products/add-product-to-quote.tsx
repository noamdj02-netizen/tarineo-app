"use client";

import { useMemo, useState } from "react";
import type { TarineoProduct } from "@/components/tarineo/types";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export function AddProductToQuote({
  products,
  onSelect,
}: {
  products: TarineoProduct[];
  onSelect?: (product: TarineoProduct) => void;
}) {
  const [q, setQ] = useState("");
  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    if (!needle) return products.slice(0, 8);
    return products.filter((p) => p.name.toLowerCase().includes(needle)).slice(0, 8);
  }, [products, q]);

  return (
    <div className="flex flex-col gap-3 p-4">
      <label className="text-[13px] text-muted-foreground">
        Rechercher un produit enregistré
        <Input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Nom ou référence"
          className="mt-1.5 h-11 rounded-xl"
        />
      </label>
      <ul className="max-h-[240px] divide-y divide-line overflow-y-auto rounded-xl border border-line">
        {filtered.map((p) => (
          <li key={p.id} className="flex items-center justify-between gap-2 px-3 py-2.5">
            <span className="min-w-0 truncate text-[14px] text-ink">{p.name}</span>
            <Button type="button" size="sm" onClick={() => onSelect?.(p)} disabled={!onSelect}>
              Ajouter
            </Button>
          </li>
        ))}
        {!filtered.length ? (
          <li className="px-3 py-4 text-[13px] text-muted-foreground">Aucun résultat.</li>
        ) : null}
      </ul>
    </div>
  );
}
