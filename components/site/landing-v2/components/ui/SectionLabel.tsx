"use client";

import type { ReactNode } from "react";

import {
  LandingStagger,
  LandingStaggerItem,
} from "@/components/site/landing-v2/lib/landing-motion";

/**
 * Libellé technique repris du dashboard : « / AUTOMATISATIONS /// ».
 */
export function SectionLabel({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <p className={`eyebrow ${className}`}>
      <span aria-hidden="true">/ </span>
      {children}
      <span aria-hidden="true">{" ///"}</span>
    </p>
  );
}

export function SectionHeading({
  label,
  title,
  subtitle,
  align = "left",
  id,
}: {
  label: string;
  title: ReactNode;
  subtitle?: ReactNode;
  align?: "left" | "center";
  id?: string;
}) {
  return (
    <LandingStagger
      className={align === "center" ? "mx-auto max-w-2xl text-center" : "max-w-2xl"}
      stagger={0.07}
    >
      <LandingStaggerItem>
        <SectionLabel>{label}</SectionLabel>
      </LandingStaggerItem>
      <LandingStaggerItem>
        <h2 id={id} className="mt-4 text-title font-semibold tracking-tight text-ink-900">
          {title}
        </h2>
      </LandingStaggerItem>
      {subtitle ? (
        <LandingStaggerItem>
          <p className="mt-4 text-body-lg text-ink-600">{subtitle}</p>
        </LandingStaggerItem>
      ) : null}
    </LandingStagger>
  );
}
