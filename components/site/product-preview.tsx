"use client";

import dynamic from "next/dynamic";
import { useState } from "react";
import { ProductPreviewWelcome } from "@/components/site/product-preview-welcome";

const ProductPreviewStage = dynamic(
  () => import("@/components/site/product-preview-stage").then((m) => m.ProductPreviewStage),
  {
    loading: () => (
      <div
        className="min-h-[min(360px,55vh)] animate-pulse rounded-[28px] border border-line bg-surface-2/80"
        aria-hidden
      />
    ),
  },
);

/** Aperçu marketing : intro chat légère, démo cockpit en chunk séparé. */
export function ProductPreview() {
  const [intro, setIntro] = useState(true);

  if (intro) {
    return <ProductPreviewWelcome onStart={() => setIntro(false)} />;
  }

  return <ProductPreviewStage />;
}
