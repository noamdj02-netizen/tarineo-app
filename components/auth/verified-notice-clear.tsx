"use client";

import { useEffect } from "react";
import { publishAuthLanding } from "@/components/auth/follow-auth";
import { VERIFIED_COOKIE } from "@/lib/auth/verified";

/** Une seule fois : l’autre onglet suit, et un rafraîchissement ne répète pas le message. */
export function VerifiedNoticeClear() {
  useEffect(() => {
    publishAuthLanding(`${window.location.pathname}${window.location.search}`);
    document.cookie = `${VERIFIED_COOKIE}=; path=/; max-age=0`;
  }, []);
  return null;
}
