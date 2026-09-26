"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";

const STORAGE_KEY = "navpit:cookie-consent-v1";

export type CookieConsent = "all" | "essential";

export function readCookieConsent(): CookieConsent | null {
  if (typeof window === "undefined") return null;
  try {
    const v = localStorage.getItem(STORAGE_KEY);
    return v === "all" || v === "essential" ? v : null;
  } catch {
    return null;
  }
}

function applyGtmConsent(value: CookieConsent | null) {
  if (typeof window === "undefined") return;
  const granted = value === "all";
  const state = {
    ad_storage: granted ? "granted" : "denied",
    ad_user_data: granted ? "granted" : "denied",
    ad_personalization: granted ? "granted" : "denied",
    analytics_storage: granted ? "granted" : "denied",
  };
  window.dataLayer = window.dataLayer || [];
  if (typeof window.gtag === "function") {
    window.gtag("consent", "update", state);
  } else {
    window.dataLayer.push(["consent", "update", state]);
  }
}

export function writeCookieConsent(value: CookieConsent) {
  try {
    localStorage.setItem(STORAGE_KEY, value);
  } catch {
    // quota
  }
  applyGtmConsent(value);
  window.dispatchEvent(new CustomEvent("navpit:cookie-consent", { detail: value }));
}

/** Bandeau CNIL : analytics uniquement après consentement. */
export function CookieConsentBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const current = readCookieConsent();
    applyGtmConsent(current);
    if (!current) setVisible(true);
  }, []);

  if (!visible) return null;

  function choose(value: CookieConsent) {
    writeCookieConsent(value);
    setVisible(false);
  }

  return (
    <div
      role="dialog"
      aria-labelledby="cookie-title"
      className="fixed inset-x-0 bottom-0 z-[60] border-t border-line bg-surface/95 p-4 shadow-lift backdrop-blur-xl sm:px-6"
    >
      <div className="mx-auto flex max-w-[1120px] flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0 text-[13.5px] leading-relaxed text-ink/80">
          <p id="cookie-title" className="font-semibold text-ink">Cookies</p>
          <p className="mt-1">
            Navpit utilise des cookies essentiels (connexion) et, si tu acceptes, des cookies de mesure
            d’audience anonymes.{" "}
            <Link href="/confidentialite#cookies" className="underline underline-offset-2">
              En savoir plus
            </Link>
          </p>
        </div>
        <div className="flex shrink-0 flex-wrap gap-2">
          <Button type="button" variant="outline" size="sm" className="rounded-full" onClick={() => choose("essential")}>
            Essentiels uniquement
          </Button>
          <Button type="button" size="sm" className="rounded-full" onClick={() => choose("all")}>
            Tout accepter
          </Button>
        </div>
      </div>
    </div>
  );
}
