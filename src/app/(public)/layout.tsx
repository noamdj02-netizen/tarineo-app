import { Manrope, Inter } from "next/font/google";
import { auth } from "@/auth";
import { PublicHeader } from "./PublicHeader";

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

export default async function PublicLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();

  return (
    <div className={`${manrope.variable} ${inter.variable} landing-theme landing-body min-h-full`}>
      <PublicHeader sessionUser={Boolean(session?.user)} />
      <main className="flex-1">{children}</main>
    </div>
  );
}
