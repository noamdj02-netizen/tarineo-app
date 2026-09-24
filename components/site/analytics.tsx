"use client";

import Script from "next/script";
import { useEffect, useState } from "react";
import { readCookieConsent } from "@/components/site/cookie-consent";

/** Google Analytics 4 — chargé seulement si consentement « tout accepter ». */
export function SiteAnalytics() {
  const id = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    if (!id) return;
    const sync = () => setEnabled(readCookieConsent() === "all");
    sync();
    window.addEventListener("navpit:cookie-consent", sync);
    return () => window.removeEventListener("navpit:cookie-consent", sync);
  }, [id]);

  if (!id || !enabled) return null;

  return (
    <>
      <Script src={`https://www.googletagmanager.com/gtag/js?id=${id}`} strategy="afterInteractive" />
      <Script id="navpit-ga" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${id}', { anonymize_ip: true });
        `}
      </Script>
    </>
  );
}
