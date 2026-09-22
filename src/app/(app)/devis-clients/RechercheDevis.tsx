"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

export function RechercheDevis({ valeurInitiale }: { valeurInitiale: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [valeur, setValeur] = useState(valeurInitiale);
  const [valeurInitialePrecedente, setValeurInitialePrecedente] = useState(valeurInitiale);
  if (valeurInitiale !== valeurInitialePrecedente) {
    setValeurInitialePrecedente(valeurInitiale);
    setValeur(valeurInitiale);
  }

  useEffect(() => {
    const q = valeur.trim();
    const actuel = searchParams.get("q") ?? "";
    if (q === actuel) return;

    const timer = window.setTimeout(() => {
      const params = new URLSearchParams(searchParams.toString());
      if (q) params.set("q", q);
      else params.delete("q");
      const suffixe = params.toString();
      router.replace(suffixe ? `/devis-clients?${suffixe}` : "/devis-clients", { scroll: false });
    }, 300);

    return () => window.clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- on compare q à searchParams avant navigation
  }, [valeur, router]);

  return (
    <label className="flex h-11 w-full items-center gap-3 rounded-full bg-[#F8F8F8] px-4 sm:max-w-sm">
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="size-4 shrink-0 text-foreground" fill="currentColor" aria-hidden="true">
        <path
          fillRule="evenodd"
          d="M10.5 3.75a6.75 6.75 0 1 0 0 13.5 6.75 6.75 0 0 0 0-13.5ZM2.25 10.5a8.25 8.25 0 1 1 14.59 5.28l4.69 4.69a.75.75 0 1 1-1.06 1.06l-4.69-4.69A8.25 8.25 0 0 1 2.25 10.5Z"
          clipRule="evenodd"
        />
      </svg>
      <input
        type="search"
        value={valeur}
        onChange={(e) => setValeur(e.target.value)}
        placeholder="N° de devis ou client…"
        className="w-full bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground"
      />
    </label>
  );
}
