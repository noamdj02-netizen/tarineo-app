import Link from "next/link";
import { notFound } from "next/navigation";
import { PageHead } from "@/components/shell/page-head";
import { TarineoPanelCard } from "@/components/tarineo/cards/tarineo-panel-card";
import { ProductDetail } from "@/components/tarineo/products/product-detail";
import {
  adaptPriceHistoryFromAlerts,
  adaptSupplierQuoteLines,
} from "@/lib/tarineo/adapters";
import { productSlug } from "@/lib/tarineo/product-slug";
import { listAlerts, listDocuments, rankingRows } from "@/lib/metier/queries";
import { R } from "@/lib/routes";

type PageProps = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params;
  const { articles } = await rankingRows();
  const article = articles.find((a) => productSlug(a.label) === slug);
  return { title: article ? `${article.label} — Produits` : "Produit" };
}

export default async function AchatsProduitDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const [{ articles }, alerts, docs] = await Promise.all([
    rankingRows(),
    listAlerts(),
    listDocuments({ direction: "in" }),
  ]);
  const article = articles.find((a) => productSlug(a.label) === slug);
  if (!article) notFound();

  const product = {
    id: slug,
    name: article.label,
    supplierRef: null,
    distributorRef: null,
    lastPriceHt: article.qty > 0 ? Math.round((article.amount / article.qty) * 100) / 100 : null,
  };

  const relatedDoc =
    docs.find((d) => d.lines.some((l) => l.label.toLowerCase() === article.label.toLowerCase())) ?? docs[0] ?? null;

  const quoteLines = relatedDoc
    ? adaptSupplierQuoteLines({
        ...relatedDoc,
        lines: relatedDoc.lines.filter((l) => l.label.toLowerCase() === article.label.toLowerCase()),
      })
    : [];

  return (
    <section className="flex flex-col gap-8 pb-10">
      <PageHead
        label="Achats"
        title={article.label}
        crumbs={[
          { href: "/accueil", label: "Accueil" },
          { href: R.achats, label: "Achats" },
          { href: R.achatsProduits, label: "Produits" },
          { label: article.label },
        ]}
        action={
          <Link
            href={R.achatsProduits}
            className="inline-flex h-9 items-center rounded-[10px] border border-line bg-surface px-4 text-[13.5px] font-medium text-ink hover:bg-surface-2"
          >
            ← Tous les produits
          </Link>
        }
      >
        Prix d’achat, historique et pièces liées pour cet article.
      </PageHead>

      <TarineoPanelCard title="Fiche produit">
        <ProductDetail
          product={product}
          priceHistory={adaptPriceHistoryFromAlerts(alerts, product.name)}
          quoteLines={quoteLines}
          documentsHref={relatedDoc ? R.piece(relatedDoc.id) : undefined}
        />
      </TarineoPanelCard>
    </section>
  );
}
