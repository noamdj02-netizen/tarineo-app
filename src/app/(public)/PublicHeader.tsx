"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { LandingLogo } from "./_components/LandingLogo";
import { LandingNav } from "./LandingNav";

export function PublicHeader() {
  const pathname = usePathname();
  const accueil = pathname === "/";
  const { status } = useSession();
  const sessionUser = status === "authenticated";

  return (
    <header className={`z-30 ${accueil ? "absolute inset-x-0 top-8" : "sticky top-0 border-b border-black/[0.06] bg-white/95 backdrop-blur-md"}`}>
      <div className="landing-container">
        <div className="flex items-center justify-between gap-4 rounded-full bg-white px-[30px] py-3 shadow-[0_8px_32px_rgba(0,0,0,0.12)]">
          <LandingLogo />

          <div className="flex items-center gap-x-3 sm:gap-x-5">
            <LandingNav variant={accueil ? "hero" : "light"} />
            {sessionUser ? (
              <Link
                href="/accueil"
                className="landing-gradient-bg landing-display whitespace-nowrap rounded-full px-6 py-3.5 text-base font-medium text-white transition-opacity hover:opacity-90 sm:px-8"
              >
                Mon espace
              </Link>
            ) : (
              <>
                <Link
                  href="/connexion"
                  className="landing-display hidden whitespace-nowrap text-base font-medium text-[var(--landing-text)] transition-colors hover:text-[var(--landing-accent)] sm:inline"
                >
                  Se connecter
                </Link>
                <Link
                  href="/inscription"
                  className="landing-gradient-bg landing-display whitespace-nowrap rounded-full px-6 py-3.5 text-base font-medium text-white transition-opacity hover:opacity-90 sm:px-8"
                >
                  Commencer
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
