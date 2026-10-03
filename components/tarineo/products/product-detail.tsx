"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { ProductCategoryIcon } from "@/components/tarineo/product-category-icon";
import { ProductPriceHistory } from "@/components/tarineo/products/product-price-history";
import { SupplierQuote } from "@/components/tarineo/quotes/supplier-quote";
import type { PriceHistoryPoint, SupplierQuoteLine, TarineoProduct } from "@/components/tarineo/types";
import { cn } from "@/lib/utils";

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
        <div className="flex min-w-0 items-start gap-3">
          <ProductCategoryIcon name={product.name} className="size-12 rounded-2xl" />
          <div className="min-w-0">
            <h3 className="font-display text-[20px] font-semibold tracking-tight text-ink">{product.name}</h3>
            <p className="mt-1 text-[13px] text-muted-foreground">
              Code fournisseur : {product.supplierRef ?? "—"}
            </p>
            <p className="text-[13px] text-muted-foreground">
              Code distributeur : {product.distributorRef ?? "—"}
            </p>
          </div>
        </div>
        <Button
          type="button"
          variant="secondary"
          className="rounded-full bg-[#FF6B1A]/10 text-ink hover:bg-[#FF6B1A]/15"
          onClick={onAddToQuote}
          disabled={!onAddToQuote}
        >
          + Ajouter au devis
        </Button>
      </div>

      <Tabs defaultValue="history">
        <TabsList className="h-auto w-full justify-start gap-6 rounded-none border-b border-line bg-transparent p-0">
          {[
            { value: "history", label: "Historique" },
            { value: "prices", label: "Prix" },
            { value: "quotes", label: "Devis" },
            { value: "docs", label: "Documents" },
          ].map((tab) => (
            <TabsTrigger
              key={tab.value}
              value={tab.value}
              className={cn(
                "rounded-none border-0 border-b-2 border-transparent bg-transparent px-0 pb-3 shadow-none",
                "data-[state=active]:border-[#FF6B1A] data-[state=active]:bg-transparent data-[state=active]:text-[#E85A12]",
              )}
            >
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>
        <TabsContent value="history" className="mt-3">
          <ProductPriceHistory productName={product.name} points={priceHistory} showChart />
        </TabsContent>
        <TabsContent value="prices" className="mt-3">
          <ProductPriceHistory productName={product.name} points={priceHistory} showChart />
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
