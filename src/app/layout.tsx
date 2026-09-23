import type { Metadata, Viewport } from "next";
import { Barlow, Inter, Manrope } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import { urlSite } from "@/lib/siteUrl";
import { ChunkLoadRecovery } from "./_components/ChunkLoadRecovery";
import { Analytics } from "./_components/Analytics";
import { BandeauCookies } from "@/components/tarineo/BandeauCookies";

const barlow = Barlow({
  variable: "--font-barlow",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
});

const site = urlSite();

export const metadata: Metadata = {
  metadataBase: new URL(site),
  title: {
    default: "Tarineo — Contrôlez vos devis fournisseurs",
    template: "%s | Tarineo",
  },
  description:
    "Comparez vos devis fournisseurs à votre historique d'achats. Détectez les hausses de prix chez Cedeo, Point P, Rexel et 30+ distributeurs.",
  applicationName: "Tarineo",
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Tarineo",
  },
  icons: {
    icon: [
      { url: "/favicon-16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-32.png", sizes: "32x32", type: "image/png" },
      { url: "/landing/logo-icon.png", type: "image/png" },
    ],
    apple: [{ url: "/brand/logo-128.png", sizes: "180x180", type: "image/png" }],
  },
  openGraph: {
    type: "website",
    locale: "fr_FR",
    url: site,
    siteName: "Tarineo",
    title: "Tarineo — Contrôlez vos devis fournisseurs",
    description: "Protégez votre marge : détectez les hausses de prix sur vos devis fournisseurs.",
    images: [{ url: "/og.png", width: 1200, height: 630, alt: "Tarineo — devis fournisseurs" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Tarineo — Contrôlez vos devis fournisseurs",
    description: "Protégez votre marge : détectez les hausses de prix sur vos devis fournisseurs.",
    images: ["/og.png"],
  },
  verification: process.env.GOOGLE_SITE_VERIFICATION
    ? { google: process.env.GOOGLE_SITE_VERIFICATION }
    : undefined,
  formatDetection: {
    telephone: false,
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  viewportFit: "cover",
  themeColor: "#F5F5F3",
};

// Coquille minimale : la distinction pages publiques (marketing, connexion) / pages
// connectées (sidebar) se fait au niveau des groupes de routes (public)/layout.tsx et
// (app)/layout.tsx, pas ici — sinon rien n'empêche une session active de faire
// apparaître la sidebar par-dessus une page publique comme "/".
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="fr"
      className={cn("h-full antialiased", barlow.variable, inter.variable, manrope.variable, "font-sans")}
    >
      <body className="min-h-full flex flex-col font-sans antialiased">
        <ChunkLoadRecovery />
        {children}
        <BandeauCookies />
        <Analytics />
      </body>
    </html>
  );
}
