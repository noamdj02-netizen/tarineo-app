"use client";

import { useEffect, useState } from "react";

/** `true` only after the first client effect — SSR et premier paint client restent alignés. */
export function useMounted() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);
  return mounted;
}
