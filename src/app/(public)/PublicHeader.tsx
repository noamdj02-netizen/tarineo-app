"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LandingLogo } from "./_components/LandingLogo";
import { LandingNav } from "./LandingNav";

interface Props {
  sessionUser: boolean;
}

export function PublicHeader({ sessionUser }: Props) {
  const pathname = usePathname();
  const accueil = pathname === "/";

  return (
    <header className={`z-30 ${accueil ? "absolute inset-x-0 top-8" : "sticky top-0 border-b border-black/[0.06] bg-white/95 backdrop-blur-md"}`}>
      <div className="landing-container">
        <div className="flex items-center justify-between gap-4 rounded-full bg-white px-[30px] py-3 shadow-[0_8px_32px_rgba(0,0,0,0.12)]">
          <LandingLogo />

          <div className="flex items-center gap-x-3 sm:gap-x-6">
            <LandingNav variant={accueil ? "hero" : "light"} />
            {sessionUser ? (
              <Link
                href="/accueil"
                className="landing-gradient-bg landing-display whitespace-nowrap rounded-full px-8 py-3.5 text-base font-medium text-white transition-opacity hover:opacity-90"
              >
                Mon espace
              </Link>
            ) : (
              <Link
                href="/inscription"
                className="landing-gradient-bg landing-display whitespace-nowrap rounded-full px-8 py-3.5 text-base font-medium text-white transition-opacity hover:opacity-90"
              >
                Commencer
              </Link>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
