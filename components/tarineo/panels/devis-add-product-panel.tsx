"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { Loader2 } from "lucide-react";
import { createDevisFromSavedProductAction } from "@/app/(app)/metier/actions";
import { AddProductToQuote } from "@/components/tarineo/products/add-product-to-quote";
import type { TarineoProduct } from "@/components/tarineo/types";

export function DevisAddProductPanel({ products }: { products: TarineoProduct[] }) {
  const router = useRouter();
  const [pending, start] = useTransition();

  function onSelect(product: TarineoProduct) {
    if (pending) return;
    start(async () => {
      const res = await createDevisFromSavedProductAction({
        name: product.name,
        unitPriceHT: product.lastPriceHt ?? null,
      });
      if (res.ok) router.push(`/pieces/${res.id}`);
    });
  }

  return (
    <div className="relative">
      {pending ? (
        <p className="flex items-center gap-2 px-4 pb-2 text-[13px] text-muted-foreground" aria-live="polite">
          <Loader2 className="size-4 animate-spin" aria-hidden />
          Création du devis…
        </p>
      ) : null}
      <AddProductToQuote products={products} onSelect={onSelect} />
    </div>
  );
}
