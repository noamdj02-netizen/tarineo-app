import type { Metadata, Viewport } from "next";
import Script from "next/script";
import {
  Barlow,
  Instrument_Serif,
  Inter_Tight,
  JetBrains_Mono,
  Space_Grotesk,
} from "next/font/google";
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

const interTight = Inter_Tight({
  variable: "--font-inter-tight",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

/** Typo de marque TARINEO (site public) — même police que l'app TARINEO. */
const barlow = Barlow({
  variable: "--font-barlow",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const jetbrains = JetBrains_Mono({
  variable: "--font-jetbrains",
  subsets: ["latin"],
  weight: ["400", "500"],
});

/** Deux entrées : Turbopack plante si `style` est un tableau (une seule requête font autorisée). */
const instrumentSerif = Instrument_Serif({
  variable: "--font-instrument-serif",
  subsets: ["latin"],
  weight: "400",
  style: "normal",
});
const instrumentSerifItalic = Instrument_Serif({
  variable: "--font-instrument-serif-italic",
  subsets: ["latin"],
  weight: "400",
  style: "italic",
});

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
  weight: ["600", "700"],
});

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
      <body
        className={`antialiased ${interTight.variable} ${barlow.variable} ${jetbrains.variable} ${instrumentSerif.variable} ${instrumentSerifItalic.variable} ${spaceGrotesk.variable}`}
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
