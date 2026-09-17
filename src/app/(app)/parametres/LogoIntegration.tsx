"use client";

import Image from "next/image";
import { useState } from "react";
import { cn } from "@/lib/utils";

export function LogoIntegration({
  nom,
  logo,
  logoLocal,
  couleur,
  size = 48,
  className,
}: {
  nom: string;
  logo: string;
  logoLocal?: boolean;
  couleur: string;
  size?: number;
  className?: string;
}) {
  const [logoEchoue, setLogoEchoue] = useState(false);
  const initiale = nom.replace(/[^A-Za-zÀ-ÿ0-9]/g, "").charAt(0).toUpperCase() || "?";

  if (!logoEchoue) {
    return (
      <Image
        src={logo}
        alt=""
        width={size}
        height={size}
        unoptimized={logoLocal}
        onError={() => setLogoEchoue(true)}
        className={cn("size-full object-contain p-1.5", className)}
      />
    );
  }

  return (
    <span
      className={`inline-flex size-full items-center justify-center rounded-2xl text-sm font-semibold ${couleur}`}
    >
      {initiale}
    </span>
  );
}
