"use client";

import { Share, X } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { BRAND } from "@/lib/brand";
import { cn } from "@/lib/utils";

const DISMISS_KEY = "navpit_pwa_install_dismiss";

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

function isStandalone() {
  if (typeof window === "undefined") return false;
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    // iOS Safari
    ("standalone" in window.navigator && (window.navigator as Navigator & { standalone?: boolean }).standalone === true)
  );
}

function isMobileViewport() {
  return typeof window !== "undefined" && window.matchMedia("(max-width: 767px)").matches;
}

function isIos() {
  if (typeof navigator === "undefined") return false;
  return /iPhone|iPad|iPod/i.test(navigator.userAgent);
}

/** Bandeau haut d’écran : installer Navpit (PWA) sur mobile. */
export function PwaInstallBanner() {
  const [visible, setVisible] = useState(false);
  const [ios, setIos] = useState(false);
  const [prompt, setPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [busy, setBusy] = useState(false);

  const dismiss = useCallback(() => {
    localStorage.setItem(DISMISS_KEY, "1");
    setVisible(false);
  }, []);

  useEffect(() => {
    if (isStandalone() || localStorage.getItem(DISMISS_KEY) === "1") return;
    if (!isMobileViewport()) return;

    if (isIos()) {
      setIos(true);
      setVisible(true);
      return;
    }

    const onBip = (e: Event) => {
      e.preventDefault();
      setPrompt(e as BeforeInstallPromptEvent);
      setVisible(true);
    };
    window.addEventListener("beforeinstallprompt", onBip);
    return () => window.removeEventListener("beforeinstallprompt", onBip);
  }, []);

  async function installAndroid() {
    if (!prompt) return;
    setBusy(true);
    try {
      await prompt.prompt();
      await prompt.userChoice;
    } finally {
      setBusy(false);
      dismiss();
    }
  }

  if (!visible) return null;

  const spacer = "h-[calc(4.25rem+env(safe-area-inset-top,0px))] md:hidden";

  return (
    <>
      <div className={spacer} aria-hidden />
    <div
      className="fixed inset-x-0 top-0 z-[60] border-b border-line bg-surface/95 px-3 py-2.5 shadow-soft backdrop-blur-xl md:hidden"
      style={{ paddingTop: "max(0.5rem, env(safe-area-inset-top))" }}
      role="region"
      aria-label="Installer l’application"
    >
      <div className="mx-auto flex max-w-lg items-start gap-2.5">
        <img
          src={BRAND.logoSrc}
          alt=""
          width={40}
          height={40}
          className="size-10 shrink-0 rounded-xl border border-line bg-bg object-cover"
        />
        <div className="min-w-0 flex-1 pt-0.5">
          <p className="text-[14px] font-semibold tracking-[-0.02em] text-ink">Installer {BRAND.name}</p>
          {ios ? (
            <p className="mt-0.5 text-[12.5px] leading-snug text-muted-foreground">
              <Share className="mr-1 inline size-3.5 -translate-y-px" aria-hidden />
              Partager → <span className="font-medium text-ink">Sur l’écran d’accueil</span>
            </p>
          ) : (
            <p className="mt-0.5 text-[12.5px] leading-snug text-muted-foreground">
              Accès rapide comme une app, sans l’App Store.
            </p>
          )}
          {!ios && prompt ? (
            <button
              type="button"
              disabled={busy}
              onClick={installAndroid}
              className="btn-dark mt-2 inline-flex min-h-9 items-center rounded-pill px-4 text-[13px] font-semibold"
            >
              {busy ? "…" : "Installer"}
            </button>
          ) : null}
        </div>
        <button
          type="button"
          onClick={dismiss}
          className={cn(
            "flex size-9 shrink-0 items-center justify-center rounded-full text-muted-foreground",
            "hover:bg-muted hover:text-foreground",
          )}
          aria-label="Fermer"
        >
          <X className="size-4" aria-hidden />
        </button>
      </div>
    </div>
    </>
  );
}
