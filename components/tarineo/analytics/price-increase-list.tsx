import { TopPriceIncreases } from "@/components/tarineo/analytics/top-price-increases";

/** Alias compact pour les listes « principales hausses » (même données que TopPriceIncreases). */
export function PriceIncreaseList(props: React.ComponentProps<typeof TopPriceIncreases>) {
  return <TopPriceIncreases {...props} />;
}
