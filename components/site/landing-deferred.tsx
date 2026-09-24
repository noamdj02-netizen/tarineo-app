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

const Pricing = dynamic(() => import("@/components/site/pricing").then((m) => m.Pricing), {
  loading: () => <BlockSkeleton className="mx-auto min-h-[520px] max-w-[1080px]" />,
});

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
  { loading: () => <BlockSkeleton className="min-h-[280px]" /> },
);

export function DeferredPricing() {
  return (
    <DeferredMount minHeight="520px" className="mx-auto max-w-[1080px]">
      <Pricing />
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

export function DeferredFaqTabs({ groups }: { groups: import("@/lib/site/content").FaqGroup[] }) {
  return (
    <DeferredMount minHeight="280px">
      <LandingFaqTabs groups={groups} />
    </DeferredMount>
  );
}
