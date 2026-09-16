import { Manrope, Inter } from "next/font/google";
import { PublicHeader } from "./PublicHeader";
import { PublicSessionProvider } from "./PublicSessionProvider";

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <PublicSessionProvider>
      <div className={`${manrope.variable} ${inter.variable} landing-theme landing-body min-h-full`}>
        <PublicHeader />
        <main className="flex-1">{children}</main>
      </div>
    </PublicSessionProvider>
  );
}
