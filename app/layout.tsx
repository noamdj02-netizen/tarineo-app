import type { Metadata, Viewport } from "next";
import Script from "next/script";
import { NavigationProgress } from "@/components/motion/navigation-progress";
import { PwaInstallBanner } from "@/components/shell/pwa-install-banner";
import { ServiceWorker } from "@/components/shell/service-worker";
import { ProductTracker } from "@/lib/analytics/client";
import { SiteAnalytics } from "@/components/site/analytics";
import { CookieConsentBanner } from "@/components/site/cookie-consent";
import { GTM_HEAD_SCRIPT, GTM_ID } from "@/lib/analytics/gtm";
import { BRAND } from "@/lib/brand";
import { siteMetadata } from "@/lib/seo";
import { getSiteUrl } from "@/lib/site-url";
import "./globals.css";

/**
 * Polices via <link> Google (pas next/font/google) :
 * en dev, next/font timeout à 3s et bloque la compile de `/` → page blanche.
 */
const GOOGLE_FONTS_HREF =
  "https://fonts.googleapis.com/css2?family=Barlow:wght@400;500;600;700&family=Inter+Tight:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&family=Instrument+Serif:ital@0;1&family=Space+Grotesk:wght@600;700&display=swap";

export const metadata: Metadata = {
  metadataBase: new URL(getSiteUrl()),
  title: { default: BRAND.name, template: `%s · ${BRAND.name}` },
  description: BRAND.description,
  applicationName: BRAND.name,
  ...siteMetadata(),
  appleWebApp: { title: BRAND.name, capable: true, statusBarStyle: "default" },
  icons: {
    icon: [
      { url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: { url: "/icons/apple-touch-icon.png", sizes: "180x180" },
    shortcut: "/icons/icon-192.png",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  // même valeur que --color-bg (globals.css)
  themeColor: "#f3f3f2",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="fr"
      // l'app est en clair : empêche studio.css de passer les couleurs d'état en mode sombre
      data-theme="light"
    >
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href={GOOGLE_FONTS_HREF} rel="stylesheet" />
      </head>
      <body className="antialiased">
        <Script id="gtm" strategy="beforeInteractive">
          {GTM_HEAD_SCRIPT}
        </Script>
        <noscript>
          <iframe
            src={`https://www.googletagmanager.com/ns.html?id=${GTM_ID}`}
            height="0"
            width="0"
            style={{ display: "none", visibility: "hidden" }}
          />
        </noscript>
        {process.env.NEXT_PUBLIC_FIGMA_CAPTURE === "1" ? (
          <Script src="https://mcp.figma.com/mcp/html-to-design/capture.js" strategy="beforeInteractive" />
        ) : null}
        <NavigationProgress />
        <PwaInstallBanner />
        {children}
        <ProductTracker />
        <CookieConsentBanner />
        <SiteAnalytics />
        <ServiceWorker />
      </body>
    </html>
  );
}
