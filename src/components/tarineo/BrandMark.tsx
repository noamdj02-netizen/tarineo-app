"use client";

import Image from "next/image";
import { useState } from "react";
import { trouverFournisseurConnu } from "@/lib/fournisseursConnus";

const COULEUR_PAR_DEFAUT = "bg-[#F3F4F6] text-[#53616A]";

const ARRONDI = {
  full: "rounded-full",
  xl: "rounded-2xl",
  md: "rounded-[4px]",
} as const;

// Composant client uniquement pour le `onError` : les logos viennent de logo.dev (voir
// fournisseursConnus.ts), un service tiers qui peut tomber ou retirer une marque de sa
// base. Dans ce cas on retombe sur le monogramme coloré plutôt que sur une image cassée.
export function BrandMark({
  nom,
  logo,
  size = 28,
  rounded = "full",
}: {
  nom: string;
  logo?: string | null;
  size?: number;
  rounded?: keyof typeof ARRONDI;
}) {
  const [logoEchoue, setLogoEchoue] = useState(false);
  const arrondi = ARRONDI[rounded];

  if (logo && !logoEchoue) {
    return (
      <Image
        src={logo}
        alt=""
        width={size}
        height={size}
        onError={() => setLogoEchoue(true)}
        className={`shrink-0 object-contain ${arrondi}`}
        style={{ width: size, height: size }}
      />
    );
  }

  const couleur = trouverFournisseurConnu(nom)?.couleur ?? COULEUR_PAR_DEFAUT;

  return (
    <span
      className={`inline-flex shrink-0 items-center justify-center font-semibold ${couleur} ${arrondi}`}
      style={{ width: size, height: size, fontSize: size > 36 ? 18 : 13 }}
    >
      {nom.charAt(0).toUpperCase()}
    </span>
  );
}
