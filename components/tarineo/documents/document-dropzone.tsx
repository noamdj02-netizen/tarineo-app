"use client";

import type { ReactNode } from "react";

/**
 * Enveloppe visuelle Figma — le comportement d’import reste dans `DocumentDrop` (données réelles).
 */
export function DocumentDropzone({
  title = "Importer un document",
  description = "PDF, JPEG, PNG ou HEIC. Glissez-déposez ou choisissez un fichier.",
  children,
}: {
  title?: string;
  description?: string;
  children: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-2">
      <div>
        <p className="font-display text-[17px] font-semibold tracking-tight text-ink">{title}</p>
        <p className="mt-1 text-[13px] text-muted-foreground">{description}</p>
      </div>
      {children}
    </div>
  );
}
