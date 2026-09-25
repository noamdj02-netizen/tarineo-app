import type { Metadata, Viewport } from "next";
import { Barlow, Inter, Manrope } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import { ChunkLoadRecovery } from "./_components/ChunkLoadRecovery";

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

export const metadata: Metadata = {
  title: "Tarinéo",
  description: "Protégez votre marge : comparez vos devis fournisseurs à votre historique d'achats.",
  applicationName: "Tarinéo",
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Tarinéo",
  },
  icons: {
    icon: [{ url: "/landing/logo-icon.png", type: "image/png" }],
    apple: [{ url: "/brand/logo-128.png", sizes: "180x180", type: "image/png" }],
  },
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
      </body>
    </html>
  );
}
