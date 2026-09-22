"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

export function AidePageTooltip({ texte, className }: { texte: string; className?: string }) {
  const [ouvert, setOuvert] = useState(false);

  return (
    <div className={cn("relative inline-flex", className)}>
      <button
        type="button"
        onClick={() => setOuvert((v) => !v)}
        className="flex size-6 items-center justify-center rounded-full border border-border bg-white text-xs font-semibold text-muted-foreground hover:border-primary/40 hover:text-primary"
        aria-expanded={ouvert}
        aria-label="Aide sur ce type de document"
      >
        ?
      </button>
      {ouvert && (
        <>
          <button
            type="button"
            className="fixed inset-0 z-40 cursor-default bg-transparent"
            aria-label="Fermer l'aide"
            onClick={() => setOuvert(false)}
          />
          <p className="absolute left-0 top-8 z-50 w-72 rounded-xl border border-border bg-white p-3 text-xs leading-relaxed text-muted-foreground shadow-lg">
            {texte}
          </p>
        </>
      )}
    </div>
  );
}
