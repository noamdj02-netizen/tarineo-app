"use client";

import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { ONBOARD_SWIPES } from "@/lib/onboarding/catalog";
import { cn } from "@/lib/utils";

export function SwipeScreen({
  answers,
  onAnswer,
}: {
  answers: boolean[];
  onAnswer: (index: number, yes: boolean) => void;
}) {
  const index = Math.min(answers.length, ONBOARD_SWIPES.length - 1);
  const done = answers.length >= ONBOARD_SWIPES.length;
  const card = ONBOARD_SWIPES[index];
  const startX = useRef<number | null>(null);
  const [dx, setDx] = useState(0);

  function settle(yes: boolean) {
    if (done) return;
    onAnswer(index, yes);
    setDx(0);
    startX.current = null;
  }

  return (
    <>
      <h2 className="font-serif text-[1.7rem] leading-[1.1] tracking-[-0.02em]">
        Ça te parle ?
      </h2>
      <p className="mt-2 text-[14.5px] leading-relaxed text-muted-foreground">
        Droite = oui. Gauche = non. Ou les boutons.
      </p>
      <p className="mt-1 text-[12px] text-muted-foreground">
        {Math.min(answers.length + (done ? 0 : 1), 3)} / 3
      </p>
      <div
        className="relative mt-6 min-h-[8.5rem] touch-pan-x select-none sm:min-h-[10rem]"
        onPointerDown={(e) => {
          startX.current = e.clientX;
          (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
        }}
        onPointerMove={(e) => {
          if (startX.current == null) return;
          setDx(e.clientX - startX.current);
        }}
        onPointerUp={() => {
          if (Math.abs(dx) > 70) settle(dx > 0);
          else setDx(0);
          startX.current = null;
        }}
        onPointerCancel={() => {
          setDx(0);
          startX.current = null;
        }}
      >
        <div
          className={cn(
            "rounded-2xl border border-line bg-surface-2 px-5 py-8 text-center text-[17px] leading-snug",
            !done && "cursor-grab active:cursor-grabbing",
          )}
          style={{ transform: `translateX(${done ? 0 : dx}px)` }}
        >
          {done ? "Les trois sont posées." : card}
        </div>
      </div>
      {!done ? (
        <div className="mt-5 grid grid-cols-2 gap-2">
          <Button type="button" variant="outline" className="min-h-12" onClick={() => settle(false)}>
            Pas moi
          </Button>
          <Button type="button" className="min-h-12" onClick={() => settle(true)}>
            Oui, ça
          </Button>
        </div>
      ) : null}
    </>
  );
}
