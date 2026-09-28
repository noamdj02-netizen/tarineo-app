"use client";

import Link from "next/link";
import { BRAND } from "@/lib/brand";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";

const STORAGE_KEY = "tarineo:cookie-consent-v1";
const LEGACY_STORAGE_KEY = "navpit:cookie-consent-v1";
const CONSENT_EVENT = "tarineo:cookie-consent";

export type CookieConsent = "all" | "essential";

export function readCookieConsent(): CookieConsent | null {
  if (typeof window === "undefined") return null;
  try {
    const current = localStorage.getItem(STORAGE_KEY);
    if (current === "all" || current === "essential") return current;
    const legacy = localStorage.getItem(LEGACY_STORAGE_KEY);
    if (legacy === "all" || legacy === "essential") {
      localStorage.setItem(STORAGE_KEY, legacy);
      return legacy;
    }
    return null;
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
  window.dispatchEvent(new CustomEvent(CONSENT_EVENT, { detail: value }));
}

/** Bandeau CNIL : analytics uniquement après consentement. */
const BANNER_OFFSET_VAR = "--cookie-banner-offset";

export function CookieConsentBanner() {
  const pathname = usePathname();
  const [visible, setVisible] = useState(false);
  const [bannerEl, setBannerEl] = useState<HTMLDivElement | null>(null);

  useEffect(() => {
    const current = readCookieConsent();
    applyGtmConsent(current);
    if (!current) setVisible(true);
  }, []);

  const hideForOnboarding = pathname.startsWith("/onboarding");
  const showBanner = visible && !hideForOnboarding;

  useEffect(() => {
    if (!showBanner) {
      document.documentElement.style.removeProperty(BANNER_OFFSET_VAR);
      return;
    }
    if (!bannerEl) return;
    const publish = () => {
      document.documentElement.style.setProperty(
        BANNER_OFFSET_VAR,
        `${Math.ceil(bannerEl.getBoundingClientRect().height)}px`,
      );
    };
    publish();
    const ro = new ResizeObserver(publish);
    ro.observe(bannerEl);
    window.addEventListener("resize", publish);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", publish);
      document.documentElement.style.removeProperty(BANNER_OFFSET_VAR);
    };
  }, [showBanner, bannerEl]);

  if (!showBanner) return null;

  function choose(value: CookieConsent) {
    writeCookieConsent(value);
    setVisible(false);
  }

  return (
    <div
      ref={setBannerEl}
      id="cookie-consent-banner"
      role="region"
      aria-labelledby="cookie-title"
      className="theme-tarineo fixed inset-x-0 bottom-0 z-[60] border-t border-line bg-surface/95 p-4 pb-[max(1rem,env(safe-area-inset-bottom))] text-ink shadow-lift backdrop-blur-xl sm:px-6"
    >
      <div className="mx-auto flex max-w-[1120px] flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0 text-[13.5px] leading-relaxed text-ink/80">
          <p id="cookie-title" className="font-semibold text-ink">Cookies</p>
          <p className="mt-1">
            {BRAND.name} utilise des cookies essentiels (connexion) et, si vous acceptez, des cookies de mesure
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
