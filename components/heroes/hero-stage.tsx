"use client";

import { createContext, useContext } from "react";
import { fontStack, isLightHex, parseHex } from "@/lib/heroes/color";
import { cn } from "@/lib/utils";

const CaptureCtx = createContext(false);
export function useHeroCapture() {
  return useContext(CaptureCtx);
}
export function HeroCaptureScope({
  capture,
  children,
}: {
  capture: boolean;
  children: React.ReactNode;
}) {
  return <CaptureCtx.Provider value={capture}>{children}</CaptureCtx.Provider>;
}

function miseOf(values: Record<string, string>): "product" | "overlay" {
  return values.MISE === "overlay" ? "overlay" : "product";
}

export function HeroStage({
  values,
  className,
  children,
  layout,
}: {
  values: Record<string, string>;
  className?: string;
  children?: React.ReactNode;
  layout?: "product" | "overlay" | "split";
}) {
  const compact = useContext(CaptureCtx);
  const fond = parseHex(values.COULEUR_FOND || "", "#F2F3F5");
  const texte = parseHex(values.COULEUR_TEXTE || "", "#141518");
  const photo = values.URL_PORTRAIT?.trim();
  const mise = layout === "overlay" || layout === "product" ? layout : miseOf(values);
  const product = mise === "product";
  const light = isLightHex(fond);

  return (
    <div
      className={cn(
        "relative isolate overflow-hidden",
        compact ? "h-full min-h-0" : "min-h-[32rem] lg:min-h-[40rem]",
        className,
      )}
      style={{
        background: fond,
        color: texte,
        fontFamily: fontStack(values.POLICE_TITRE || ""),
      }}
    >
      <div className="absolute inset-0">
        {photo ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={photo}
            alt=""
            className={cn(
              "size-full",
              product ? "object-contain p-[8%]" : "object-cover",
            )}
          />
        ) : null}
        <div className="absolute inset-0">{children}</div>
        {product ? null : (
          <div
            className="absolute inset-0"
            style={{
              background: compact
                ? `linear-gradient(180deg, ${fond}00 42%, ${fond}c8 100%)`
                : `linear-gradient(180deg, ${fond}22 0%, ${fond}00 28%, ${fond}b8 100%)`,
            }}
          />
        )}
      </div>

      <nav
        className={cn(
          "absolute inset-x-0 top-0 z-20 flex items-center justify-between",
          compact ? "px-3 py-2 text-[10px]" : "px-6 py-4 text-[13px] sm:px-8",
        )}
      >
        <span className="font-semibold tracking-[-0.03em]">{values.MARQUE}</span>
        {compact ? (
          <span className="opacity-55">Produit</span>
        ) : (
          <span className="flex items-center gap-5 opacity-70">
            <span>Produit</span>
            <span>Prix</span>
            <span
              className="rounded-full px-3 py-1 font-medium"
              style={{ background: texte, color: fond }}
            >
              {values.CTA_PRINCIPAL}
            </span>
          </span>
        )}
      </nav>

      <div
        className={cn(
          "absolute inset-x-0 bottom-0 z-10",
          compact ? "p-3" : "p-6 sm:max-w-[34rem] sm:p-8",
        )}
      >
        <h1
          className={cn(
            "leading-[1.05] font-semibold tracking-tightest text-balance",
            compact
              ? product
                ? "sr-only"
                : "text-[clamp(15px,3.2vw,22px)]"
              : "text-[clamp(28px,4.2vw,52px)]",
          )}
        >
          {values.TITRE}
        </h1>
        {compact ? null : (
          <>
            <p className="mt-3 max-w-[40ch] text-[15px] leading-relaxed opacity-80">{values.SOUS_TITRE}</p>
            <div className="mt-5 flex flex-wrap gap-2">
              <a
                href="#cta"
                className="inline-flex min-h-11 items-center rounded-full px-4 text-[14px] font-medium focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
                style={{ background: texte, color: fond, outlineColor: texte }}
              >
                {values.CTA_PRINCIPAL}
              </a>
              <a
                href="#demo"
                className="inline-flex min-h-11 items-center rounded-full border px-4 text-[14px] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
                style={{
                  borderColor: light ? `${texte}28` : `${texte}44`,
                  outlineColor: texte,
                }}
              >
                {values.CTA_SECONDAIRE}
              </a>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
