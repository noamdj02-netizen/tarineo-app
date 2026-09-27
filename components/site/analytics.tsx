"use client";

import Script from "next/script";
import { useEffect, useState } from "react";
import { GTM_ID } from "@/lib/analytics/gtm";
import { readCookieConsent } from "@/components/site/cookie-consent";

/** GA4 seul si GTM n’est pas dans le layout. Après « Tout accepter ». */
export function SiteAnalytics() {
  const ga = GTM_ID ? undefined : process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    if (!ga) return;
    const sync = () => setEnabled(readCookieConsent() === "all");
    sync();
    window.addEventListener("tarineo:cookie-consent", sync);
    return () => window.removeEventListener("tarineo:cookie-consent", sync);
  }, [ga]);

  if (!ga || !enabled) return null;

  return (
    <>
      <Script src={`https://www.googletagmanager.com/gtag/js?id=${ga}`} strategy="afterInteractive" />
      <Script id="navpit-ga" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${ga}', { anonymize_ip: true });
        `}
      </Script>
    </>
  );
}
