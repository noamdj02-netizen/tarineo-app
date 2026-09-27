"use client";

import Image from "next/image";
import { useState } from "react";
import { brandLogoUrl } from "@/lib/resources/logo";
import { SUPPLIER_DOMAINS } from "@/lib/site/tarineo";
import { cn } from "@/lib/utils";

/**
 * Logo d'enseigne (logo.dev) sur pastille blanche, pour rester lisible sur fond sombre.
 * Repli : initiale, si la clé logo.dev manque ou si l'image ne charge pas.
 */
export function SupplierLogo({
  name,
  size = 36,
  className,
  priority = false,
}: {
  name: string;
  size?: number;
  className?: string;
  /** Hero / above-the-fold only. */
  priority?: boolean;
}) {
  const [failed, setFailed] = useState(false);
  const domain = SUPPLIER_DOMAINS[name];
  const src = domain ? brandLogoUrl(domain, 96) : null;

  return (
    <span
      className={cn(
        "grid shrink-0 place-items-center overflow-hidden rounded-lg bg-white ring-1 ring-black/5",
        className,
      )}
      style={{ width: size, height: size }}
    >
      {src && !failed ? (
        <Image
          src={src}
          alt={`Logo ${name}`}
          width={size}
          height={size}
          unoptimized
          priority={priority}
          loading={priority ? "eager" : "lazy"}
          onError={() => setFailed(true)}
          className="size-full object-contain p-[12%]"
        />
      ) : (
        <span className="font-display text-[15px] font-bold text-black/80" aria-label={name}>
          {name.charAt(0)}
        </span>
      )}
    </span>
  );
}
