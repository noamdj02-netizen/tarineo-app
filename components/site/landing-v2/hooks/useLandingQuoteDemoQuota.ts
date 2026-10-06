"use client";

import { useCallback, useEffect, useState } from "react";

import {
  hasUsedFreeLandingTransform,
  markFreeLandingTransformUsed,
} from "@/lib/site/landing-quote-demo-quota";

export function useLandingQuoteDemoQuota() {
  const [used, setUsed] = useState(false);

  useEffect(() => {
    setUsed(hasUsedFreeLandingTransform());
  }, []);

  const markUsed = useCallback(() => {
    markFreeLandingTransformUsed();
    setUsed(true);
  }, []);

  return { used, markUsed };
}
