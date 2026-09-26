"use client";

import { useEffect, useState } from "react";
import { finishDashboardTour } from "@/app/(onboard)/onboarding/actions";
import { Illustration } from "@/components/illustration";
import { Button } from "@/components/ui/button";
import type { IllustrationName } from "@/lib/illustrations";
import { cn } from "@/lib/utils";

const SPOTS = [
  {
    id: "prompt",
    art: "onboarding-bienvenue" as IllustrationName,
    title: "Pose une question ici",
    text: "Le copilote part de ton projet Focus. Une phrase suffit.",
  },
  {
    id: "actions",
    art: "dashboard-focus" as IllustrationName,
    title: "Ta prochaine action",
    text: "Focus, landing, thème. Un geste, pas une liste de 20.",
  },
  {
    id: "compose",
    art: "landing-commencer" as IllustrationName,
    title: "Composer le cockpit",
    text: "Tu ajoutes ou retires des blocs. Rien n’est figé.",
  },
] as const;

function visibleSpot(id: string) {
  const nodes = [...document.querySelectorAll<HTMLElement>(`[data-tour="${id}"]`)];
  return nodes.find((n) => n.getClientRects().length > 0) ?? null;
}

export function DashboardTour({ open }: { open: boolean }) {
  const [index, setIndex] = useState(0);
  const [box, setBox] = useState<DOMRect | null>(null);
  const [cardLow, setCardLow] = useState(true);
  const [alive, setAlive] = useState(open);

  useEffect(() => {
    setAlive(open);
  }, [open]);

  useEffect(() => {
    if (!alive) return;
    const place = () => {
      const el = visibleSpot(SPOTS[index].id);
      const next = el?.getBoundingClientRect() ?? null;
      setBox(next);
      setCardLow(!next || next.bottom > window.innerHeight * 0.55);
    };
    place();
    window.addEventListener("resize", place);
    window.addEventListener("scroll", place, true);
    const t = window.setInterval(place, 400);
    return () => {
      window.removeEventListener("resize", place);
      window.removeEventListener("scroll", place, true);
      window.clearInterval(t);
    };
  }, [alive, index]);

  if (!alive) return null;

  const spot = SPOTS[index];
  const last = index === SPOTS.length - 1;
  const pad = 8;

  function close() {
    setAlive(false);
    void finishDashboardTour();
  }

  return (
    <div className="fixed inset-0 z-[80]" role="dialog" aria-label="Guide accueil">
      <div className="absolute inset-0 bg-ink/50" onClick={close} />
      {box ? (
        <div
          aria-hidden
          className="pointer-events-none absolute rounded-2xl ring-2 ring-accent-ink/90"
          style={{
            top: box.top - pad,
            left: box.left - pad,
            width: box.width + pad * 2,
            height: box.height + pad * 2,
            boxShadow: "0 0 0 9999px rgba(18, 16, 14, 0.55)",
          }}
        />
      ) : null}
      <div
        className={cn(
          "absolute left-4 right-4 z-[81] max-w-sm rounded-2xl border border-line bg-surface p-4 shadow-lift sm:left-auto sm:right-6",
          !cardLow ? "top-[min(72vh,calc(100dvh-12rem))]" : "bottom-6",
        )}
      >
        <Illustration name={spot.art} className="mb-2 size-14" />
        <p className="mono-label mb-1">{`/ ${index + 1} · ${SPOTS.length} ///`}</p>
        <p className="font-serif text-[1.35rem] leading-tight tracking-[-0.02em]">{spot.title}</p>
        <p className="mt-1.5 text-[14px] leading-relaxed text-muted-foreground">{spot.text}</p>
        <div className="mt-4 flex items-center gap-2">
          <Button type="button" variant="ghost" className="px-2" onClick={close}>
            Plus tard
          </Button>
          <Button
            type="button"
            className="ml-auto"
            onClick={() => {
              if (last) close();
              else setIndex((i) => i + 1);
            }}
          >
            {last ? "C’est bon" : "Suivant"}
          </Button>
        </div>
      </div>
    </div>
  );
}
