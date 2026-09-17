import type { Metadata } from "next";
import { Barlow, Inter, Manrope } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";

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
      <body className="min-h-full flex flex-col font-sans antialiased">{children}</body>
    </html>
  );
}
