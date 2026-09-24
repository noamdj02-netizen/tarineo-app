import type { Metadata, Viewport } from "next";
import {
  Instrument_Serif,
  Inter_Tight,
  JetBrains_Mono,
  Space_Grotesk,
} from "next/font/google";
import { NavigationProgress } from "@/components/motion/navigation-progress";
import { PwaInstallBanner } from "@/components/shell/pwa-install-banner";
import { ServiceWorker } from "@/components/shell/service-worker";
import { SiteAnalytics } from "@/components/site/analytics";
import { CookieConsentBanner } from "@/components/site/cookie-consent";
import { BRAND } from "@/lib/brand";
import { siteMetadata } from "@/lib/seo";
import { getSiteUrl } from "@/lib/site-url";
import "./globals.css";

const interTight = Inter_Tight({
  variable: "--font-inter-tight",
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
      className={`${interTight.variable} ${jetbrains.variable} ${instrumentSerif.variable} ${instrumentSerifItalic.variable} ${spaceGrotesk.variable}`}
    >
      <body className="antialiased">
        <NavigationProgress />
        <PwaInstallBanner />
        {children}
        <CookieConsentBanner />
        <SiteAnalytics />
        <ServiceWorker />
      </body>
    </html>
  );
}
