"use client";

import dynamic from "next/dynamic";
import { DeferredMount } from "@/components/ui/deferred-mount";

function BlockSkeleton({ className }: { className?: string }) {
  return (
    <div
      aria-hidden
      className={`animate-pulse rounded-[24px] border border-line bg-surface-2/70 ${className ?? ""}`}
    />
  );
}

const Pricing = dynamic(() => import("@/components/site/landing-pricing").then((m) => m.LandingPricing), {
  loading: () => <BlockSkeleton className="mx-auto min-h-[520px] max-w-[1080px]" />,
});

const LandingDocument = dynamic(
  () => import("@/components/site/landing-document").then((m) => m.LandingDocument),
  { loading: () => <BlockSkeleton className="mx-auto min-h-[460px] max-w-[1080px]" /> },
);

const LandingDashboard = dynamic(
  () => import("@/components/site/landing-dashboard").then((m) => m.LandingDashboard),
  { loading: () => <BlockSkeleton className="mx-auto min-h-[560px] max-w-[1120px]" /> },
);

const LandingSuppliers = dynamic(
  () => import("@/components/site/landing-suppliers").then((m) => m.LandingSuppliers),
  { loading: () => <BlockSkeleton className="mx-auto min-h-[380px] max-w-[1080px]" /> },
);

const LandingTestimonials = dynamic(
  () => import("@/components/site/landing-testimonials").then((m) => m.LandingTestimonials),
  { loading: () => <BlockSkeleton className="min-h-[420px]" /> },
);

const LandingSolutionCarousel = dynamic(
  () => import("@/components/site/landing-solution-carousel").then((m) => m.LandingSolutionCarousel),
  { loading: () => <BlockSkeleton className="min-h-[380px]" /> },
);

const LandingDiscoverStrip = dynamic(
  () => import("@/components/site/landing-discover-strip").then((m) => m.LandingDiscoverStrip),
  { loading: () => <BlockSkeleton className="min-h-[120px]" /> },
);

const LandingFaqTabs = dynamic(
  () => import("@/components/site/landing-faq-tabs").then((m) => m.LandingFaqTabs),
  { loading: () => <BlockSkeleton className="min-h-[420px]" /> },
);

const LandingProductFilm = dynamic(
  () => import("@/components/site/landing-product-film").then((m) => m.LandingProductFilm),
  { loading: () => <BlockSkeleton className="mx-auto min-h-[220px] max-w-[880px]" /> },
);

export function DeferredPricing() {
  return (
    <DeferredMount minHeight="520px" className="mx-auto max-w-[1080px]">
      <Pricing />
    </DeferredMount>
  );
}

export function DeferredDocument() {
  return (
    <DeferredMount minHeight="460px">
      <LandingDocument />
    </DeferredMount>
  );
}

export function DeferredDashboard() {
  return (
    <DeferredMount minHeight="560px">
      <LandingDashboard />
    </DeferredMount>
  );
}

export function DeferredSuppliers() {
  return (
    <DeferredMount minHeight="380px">
      <LandingSuppliers />
    </DeferredMount>
  );
}

export function DeferredTestimonials() {
  return (
    <DeferredMount minHeight="420px">
      <LandingTestimonials />
    </DeferredMount>
  );
}

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

export function DeferredFaqTabs({ groups }: { groups: import("@/lib/site/tarineo").FaqGroup[] }) {
  return (
    <DeferredMount minHeight="420px">
      <LandingFaqTabs groups={groups} />
    </DeferredMount>
  );
}

export function DeferredProductFilm() {
  return (
    <DeferredMount minHeight="220px" className="mx-auto w-full max-w-[880px]">
      <LandingProductFilm />
    </DeferredMount>
  );
}
