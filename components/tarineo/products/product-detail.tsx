"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import type { PriceHistoryPoint, TarineoProduct } from "@/components/tarineo/types";
import { ProductPriceHistory } from "@/components/tarineo/products/product-price-history";
import { SupplierQuote } from "@/components/tarineo/quotes/supplier-quote";
import type { SupplierQuoteLine } from "@/components/tarineo/types";
import { euro } from "@/lib/site/tarineo";

export function ProductDetail({
  product,
  priceHistory,
  quoteLines,
  documentsHref,
  onAddToQuote,
}: {
  product: TarineoProduct;
  priceHistory: PriceHistoryPoint[];
  quoteLines?: SupplierQuoteLine[];
  documentsHref?: string;
  onAddToQuote?: () => void;
}) {
  return (
    <div className="flex flex-col gap-4 p-4 sm:p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="font-display text-[20px] font-semibold tracking-tight text-ink">{product.name}</h3>
          <p className="mt-1 text-[13px] text-muted-foreground">
            {product.supplierRef ? `Réf. fournisseur ${product.supplierRef}` : "Réf. fournisseur —"}
            {" · "}
            {product.distributorRef ? `Réf. distributeur ${product.distributorRef}` : "Réf. distributeur —"}
          </p>
          {product.lastPriceHt != null ? (
            <p className="mt-2 text-[15px] font-medium tabular-nums text-ink">Dernier prix HT {euro(product.lastPriceHt)}</p>
          ) : null}
        </div>
        <Button type="button" className="rounded-full" onClick={onAddToQuote} disabled={!onAddToQuote}>
          Ajouter au devis
        </Button>
      </div>

      <Tabs defaultValue="history">
        <TabsList className="w-full justify-start">
          <TabsTrigger value="history">Historique</TabsTrigger>
          <TabsTrigger value="prices">Prix</TabsTrigger>
          <TabsTrigger value="quotes">Devis</TabsTrigger>
          <TabsTrigger value="docs">Documents</TabsTrigger>
        </TabsList>
        <TabsContent value="history" className="mt-3">
          <ProductPriceHistory productName={product.name} points={priceHistory} />
        </TabsContent>
        <TabsContent value="prices" className="mt-3">
          <ProductPriceHistory productName={product.name} points={priceHistory} />
        </TabsContent>
        <TabsContent value="quotes" className="mt-3">
          <SupplierQuote lines={quoteLines ?? []} />
        </TabsContent>
        <TabsContent value="docs" className="mt-3">
          {documentsHref ? (
            <a href={documentsHref} className="text-[13px] font-medium text-tarineo-orange hover:underline">
              Voir les pièces liées →
            </a>
          ) : (
            <p className="text-[13px] text-muted-foreground">Aucun document associé.</p>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
