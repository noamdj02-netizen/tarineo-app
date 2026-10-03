import type { ReactNode } from "react";

/**
 * Enveloppe de page — le dépôt Figma est rendu par `DocumentDrop` / `DocumentBulkImport`.
 */
export function DocumentDropzone({
  title,
  description,
  children,
}: {
  title?: string;
  description?: string;
  children: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-4">
      {title ? (
        <div>
          <p className="font-display text-[17px] font-semibold tracking-tight text-ink">{title}</p>
          {description ? <p className="mt-1 text-[13px] text-muted-foreground">{description}</p> : null}
        </div>
      ) : null}
      {children}
    </div>
  );
}
