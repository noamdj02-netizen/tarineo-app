"use client";

import { useEffect } from "react";
import { Illustration } from "@/components/illustration";

export function ProcessScreen({ onDone }: { onDone: () => void }) {
  useEffect(() => {
    const t = window.setTimeout(onDone, 1600);
    return () => window.clearTimeout(t);
  }, [onDone]);

  return (
    <div className="flex flex-1 flex-col items-center justify-center text-center">
      <Illustration name="dashboard-analyse" className="mb-4 size-28 sm:mb-5 sm:size-40" />
      <h2 className="font-serif text-[1.45rem] leading-[1.1] tracking-[-0.02em] sm:text-[1.7rem]">
        On prépare ton cockpit…
      </h2>
      <p className="mt-2 max-w-sm text-[14.5px] leading-relaxed text-muted-foreground">
        Un projet Focus, les blocs de l’accueil, puis l’essai Pro déjà lancé.
      </p>
    </div>
  );
}
