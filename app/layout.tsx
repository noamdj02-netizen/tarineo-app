import type { Metadata, Viewport } from "next";
import Script from "next/script";
import { Instrument_Serif, Inter_Tight, JetBrains_Mono } from "next/font/google";
import { NavigationProgress } from "@/components/motion/navigation-progress";
import { PwaInstallBanner } from "@/components/shell/pwa-install-banner";
import { ServiceWorker } from "@/components/shell/service-worker";
import { ProductTracker } from "@/lib/analytics/client";
import { SiteAnalytics } from "@/components/site/analytics";
import { CookieConsentBanner } from "@/components/site/cookie-consent";
import { ThemeProvider } from "@/components/theme/theme-provider";
import { GTM_HEAD_SCRIPT, GTM_ID } from "@/lib/analytics/gtm";
import { BRAND } from "@/lib/brand";
import { siteMetadata } from "@/lib/seo";
import { getSiteUrl } from "@/lib/site-url";
import { THEME_BOOTSTRAP_SCRIPT } from "@/lib/theme";
import "./globals.css";

/** Pas de spread dans next/font (Turbopack). Variable + preload:false limite les @font-face. */
const interTight = Inter_Tight({
  subsets: ["latin"],
  display: "swap",
  preload: false,
  variable: "--font-inter-tight",
});

const jetbrains = JetBrains_Mono({
  subsets: ["latin"],
  display: "swap",
  preload: false,
  variable: "--font-jetbrains",
  weight: "400",
});

/** Deux entrées : Turbopack plante si `style` est un tableau (une seule requête font autorisée). */
const instrumentSerif = Instrument_Serif({
  subsets: ["latin"],
  display: "swap",
  preload: false,
  variable: "--font-instrument-serif",
  weight: "400",
  style: "normal",
});
const instrumentSerifItalic = Instrument_Serif({
  subsets: ["latin"],
  display: "swap",
  preload: false,
  variable: "--font-instrument-serif-italic",
  weight: "400",
  style: "italic",
});

/** Barlow + Space Grotesk : lien Google (Turbopack casse next/font multi-poids). Voir :root dans globals.css. */
const GOOGLE_FONTS_HREF =
  "https://fonts.googleapis.com/css2?family=Barlow:wght@400;500;600;700&family=Space+Grotesk:wght@600;700&display=swap";

export const metadata: Metadata = {
  metadataBase: new URL(getSiteUrl()),
  title: { default: BRAND.name, template: `%s · ${BRAND.name}` },
  description: BRAND.description,
  applicationName: BRAND.name,
  ...siteMetadata(),
  appleWebApp: { title: BRAND.name, capable: true, statusBarStyle: "default" },
  icons: {
    icon: [
      { url: "/brand/favicon/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/brand/favicon/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: { url: "/brand/favicon/apple-touch-icon.png", sizes: "180x180" },
    shortcut: "/brand/favicon/icon-192.png",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#F5F5F3" },
    { media: "(prefers-color-scheme: dark)", color: "#0A0A0A" },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href={GOOGLE_FONTS_HREF} rel="stylesheet" />
      </head>
      <body
        className={`antialiased ${interTight.variable} ${jetbrains.variable} ${instrumentSerif.variable} ${instrumentSerifItalic.variable}`}
        suppressHydrationWarning
      >
        <Script id="tarineo-theme" strategy="beforeInteractive">
          {THEME_BOOTSTRAP_SCRIPT}
        </Script>
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
        <ThemeProvider>
          <NavigationProgress />
          <PwaInstallBanner />
          {children}
          <ProductTracker />
          <CookieConsentBanner />
          <SiteAnalytics />
          <ServiceWorker />
        </ThemeProvider>
      </body>
    </html>
  );
}
