"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";
import { featureFromPath, isEventName, type EventName } from "@/lib/analytics/catalog";
import { SESSION_COOKIE } from "@/lib/analytics/track-cookie";

function readSid() {
  if (typeof document === "undefined") return "";
  const fromCookie = document.cookie
    .split("; ")
    .find((row) => row.startsWith(`${SESSION_COOKIE}=`))
    ?.split("=")[1];
  if (fromCookie) return fromCookie;
  const fresh = crypto.randomUUID();
  document.cookie = `${SESSION_COOKIE}=${fresh}; path=/; max-age=86400; samesite=lax`;
  return fresh;
}

export function emitEvent(
  name: EventName,
  extra?: { feature?: string; path?: string; durationMs?: number; properties?: Record<string, unknown> },
) {
  if (typeof window === "undefined" || !isEventName(name)) return;
  const path = extra?.path ?? window.location.pathname;
  const body = {
    name,
    sessionId: readSid(),
    feature: extra?.feature ?? featureFromPath(path),
    path,
    durationMs: extra?.durationMs,
    properties: extra?.properties,
  };
  const payload = JSON.stringify(body);
  if (name === "session_ended" && navigator.sendBeacon) {
    navigator.sendBeacon("/api/analytics/event", new Blob([payload], { type: "application/json" }));
    return;
  }
  void fetch("/api/analytics/event", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: payload,
    keepalive: true,
  }).catch(() => {});
}

/** Pose la session et note les pages. Pas sur /admin. */
export function ProductTracker() {
  const pathname = usePathname();
  const started = useRef(false);

  useEffect(() => {
    if (pathname.startsWith("/admin")) return;
    readSid();
    if (!started.current) {
      started.current = true;
      emitEvent("session_started", { path: pathname });
      const end = () => emitEvent("session_ended", { path: window.location.pathname });
      window.addEventListener("pagehide", end);
      return () => window.removeEventListener("pagehide", end);
    }
  }, [pathname]);

  useEffect(() => {
    if (pathname.startsWith("/admin")) return;
    emitEvent("page_viewed", { path: pathname });
    if (pathname.startsWith("/prix") || pathname.startsWith("/abonnement")) {
      emitEvent("pricing_viewed", { path: pathname, feature: "pricing" });
    }
    if (pathname.startsWith("/projets/") && pathname.split("/").length >= 3) {
      emitEvent("project_opened", { path: pathname, feature: "projets" });
    }
    if (pathname.startsWith("/ressources")) {
      emitEvent("resource_opened", { path: pathname, feature: "ressources" });
    }
    if (pathname.startsWith("/composants")) {
      emitEvent("component_opened", { path: pathname, feature: "composants" });
    }
  }, [pathname]);

  return null;
}
