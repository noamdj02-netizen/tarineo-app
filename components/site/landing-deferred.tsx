"use client";

import dynamic from "next/dynamic";
import { DeferredMount } from "@/components/ui/deferred-mount";

function BlockSkeleton({ className }: { className?: string }) {
  return (
    <div
      aria-hidden
      className={`animate-pulse rounded-[16px] border border-[rgba(10,10,10,0.08)] bg-[#FFFFFF]/70 ${className ?? ""}`}
    />
  );
}

const Pricing = dynamic(() => import("@/components/site/landing-pricing").then((m) => m.LandingPricing), {
  loading: () => <BlockSkeleton className="mx-auto min-h-[520px] max-w-[1080px]" />,
});

const LandingFaqTabs = dynamic(
  () => import("@/components/site/landing-faq-tabs").then((m) => m.LandingFaqTabs),
  { loading: () => <BlockSkeleton className="min-h-[420px]" /> },
);

const ProductDemoDevisIa = dynamic(
  () => import("@/components/site/product-demo/devis-ia").then((m) => m.ProductDemoDevisIa),
  { loading: () => <BlockSkeleton className="mx-auto min-h-[360px] max-w-[1080px]" /> },
);

const ProductDemoDocuments = dynamic(
  () => import("@/components/site/product-demo/documents").then((m) => m.ProductDemoDocuments),
  { loading: () => <BlockSkeleton className="mx-auto min-h-[420px] max-w-[1080px]" /> },
);

const ProductDemoChantier = dynamic(
  () => import("@/components/site/product-demo/chantier").then((m) => m.ProductDemoChantier),
  { loading: () => <BlockSkeleton className="mx-auto min-h-[480px] max-w-[1080px]" /> },
);

const ProductDemoPipeline = dynamic(
  () => import("@/components/site/product-demo/pipeline").then((m) => m.ProductDemoPipeline),
  { loading: () => <BlockSkeleton className="mx-auto min-h-[280px] max-w-[720px]" /> },
);

const ProductDemoCopilote = dynamic(
  () => import("@/components/site/product-demo/copilote").then((m) => m.ProductDemoCopilote),
  { loading: () => <BlockSkeleton className="mx-auto min-h-[340px] max-w-[640px]" /> },
);

const ProductDemoFeatures = dynamic(
  () => import("@/components/site/product-demo/features").then((m) => m.ProductDemoFeatures),
  { loading: () => <BlockSkeleton className="mx-auto min-h-[360px] max-w-[1080px]" /> },
);

const LandingSolutionCarousel = dynamic(
  () => import("@/components/site/landing-solution-carousel").then((m) => m.LandingSolutionCarousel),
  { loading: () => <BlockSkeleton className="min-h-[380px]" /> },
);

const LandingDiscoverStrip = dynamic(
  () => import("@/components/site/landing-discover-strip").then((m) => m.LandingDiscoverStrip),
  { loading: () => <BlockSkeleton className="min-h-[120px]" /> },
);

export function DeferredPricing() {
  return (
    <DeferredMount minHeight="520px" className="mx-auto max-w-[1080px]">
      <Pricing />
    </DeferredMount>
  );
}

export function DeferredFaqTabs({ groups }: { groups: import("@/lib/site/tarineo").FaqGroup[] }) {
  return (
    <DeferredMount minHeight="420px">
      <LandingFaqTabs groups={groups} />
    </DeferredMount>
  );
}

export function DeferredProductDevisIa() {
  return (
    <DeferredMount minHeight="360px">
      <ProductDemoDevisIa />
    </DeferredMount>
  );
}

export function DeferredProductDocuments() {
  return (
    <DeferredMount minHeight="420px">
      <ProductDemoDocuments />
    </DeferredMount>
  );
}

export function DeferredProductChantier() {
  return (
    <DeferredMount minHeight="480px">
      <ProductDemoChantier />
    </DeferredMount>
  );
}

export function DeferredProductPipeline() {
  return (
    <DeferredMount minHeight="280px">
      <ProductDemoPipeline />
    </DeferredMount>
  );
}

export function DeferredProductCopilote() {
  return (
    <DeferredMount minHeight="340px">
      <ProductDemoCopilote />
    </DeferredMount>
  );
}

export function DeferredProductFeatures() {
  return (
    <DeferredMount minHeight="360px">
      <ProductDemoFeatures />
    </DeferredMount>
  );
}

/** Conservé pour LandingProductShowcase (hors page d’accueil actuelle). */
export function DeferredSolutionCarousel() {
  return (
    <DeferredMount minHeight="380px">
      <LandingSolutionCarousel />
    </DeferredMount>
  );
}

export function DeferredDiscoverStrip() {
  return (
    <DeferredMount minHeight="120px">
      <LandingDiscoverStrip />
    </DeferredMount>
  );
}
