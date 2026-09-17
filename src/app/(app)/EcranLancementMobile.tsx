"use client";

import { useState } from "react";
import { AnimationLogoChargement } from "@/components/tarineo/AnimationLogoChargement";

const CLE_SESSION = "tarineo-splash-v1";

function doitAfficherSplash(): boolean {
  if (typeof window === "undefined") return false;
  if (!window.matchMedia("(max-width: 1023px)").matches) return false;
  if (sessionStorage.getItem(CLE_SESSION)) return false;
  sessionStorage.setItem(CLE_SESSION, "1");
  return true;
}

export function EcranLancementMobile() {
  const [visible, setVisible] = useState(doitAfficherSplash);

  if (!visible) return null;

  return (
    <AnimationLogoChargement
      pleinEcran
      boucle={false}
      onTermine={() => setVisible(false)}
    />
  );
}
