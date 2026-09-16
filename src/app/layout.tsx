import type { Metadata } from "next";
import { Barlow } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";

const barlow = Barlow({
  variable: "--font-barlow",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
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
    <html lang="fr" className={cn("h-full", "antialiased", barlow.variable, "font-sans")}>
      <body className="min-h-full flex flex-col font-sans">{children}</body>
    </html>
  );
}
