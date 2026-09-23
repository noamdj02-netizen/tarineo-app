"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";

const CLE_STOCKAGE = "tarineo-cookies-ok";

/**
 * Bandeau informatif : Tarineo n'utilise que des cookies strictement nécessaires
 * (session Auth.js) + une mesure d'audience anonymisée Vercel Analytics (sans cookie
 * publicitaire). Un seul bouton « Compris » pour fermer.
 */
export function BandeauCookies() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Lecture async (après paint) pour éviter setState synchrone dans l'effet.
    const id = window.setTimeout(() => {
      try {
        if (localStorage.getItem(CLE_STOCKAGE) !== "1") {
          setVisible(true);
        }
      } catch {
        setVisible(true);
      }
    }, 0);
    return () => window.clearTimeout(id);
  }, []);

  const fermer = useCallback(() => {
    try {
      localStorage.setItem(CLE_STOCKAGE, "1");
    } catch {
      /* private mode */
    }
    setVisible(false);
  }, []);

  if (!visible) return null;

  return (
    <div
      role="dialog"
      aria-label="Information cookies"
      className="fixed inset-x-0 bottom-0 z-[300] p-4 sm:p-6 pointer-events-none"
    >
      <div className="pointer-events-auto mx-auto flex max-w-3xl flex-col gap-4 rounded-2xl border border-black/10 bg-white p-4 shadow-[0_12px_40px_rgba(0,0,0,0.18)] sm:flex-row sm:items-center sm:gap-6 sm:p-5">
        <p className="flex-1 text-sm leading-relaxed text-[#172935]">
          Tarineo utilise uniquement des cookies strictement nécessaires à la connexion, et une
          mesure d&apos;audience anonymisée (sans publicité).{" "}
          <Link href="/legal/cookies" className="font-semibold text-[#EC5821] underline-offset-2 hover:underline">
            En savoir plus
          </Link>
        </p>
        <button
          type="button"
          onClick={fermer}
          className="shrink-0 rounded-full bg-[#EC5821] px-6 py-2.5 text-sm font-bold text-white transition hover:bg-[#d44d1a]"
        >
          Compris
        </button>
      </div>
    </div>
  );
}
