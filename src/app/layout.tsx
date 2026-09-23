import type { Metadata } from "next";
import { Barlow, Inter, Manrope } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import { ChunkLoadRecovery } from "./_components/ChunkLoadRecovery";

const barlow = Barlow({
  variable: "--font-barlow",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "Tarineo",
  description: "Protégez votre marge : comparez vos devis fournisseurs à votre historique d'achats.",
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Tarineo",
  },
  icons: {
    apple: "/landing/logo-icon.png",
  },
};

export const viewport = {
  themeColor: "#EC5821",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover" as const,
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
