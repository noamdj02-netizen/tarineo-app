"use client";

import { useState } from "react";
import { Faq } from "@/components/site/faq";
import type { FaqGroup } from "@/lib/site/content";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function LandingFaqTabs({ groups }: { groups: FaqGroup[] }) {
  const [tab, setTab] = useState(groups[0]?.id ?? "");
  const active = groups.find((g) => g.id === tab) ?? groups[0];

  return (
    <div className="flex flex-col gap-4">
      <div
        className="flex flex-wrap justify-center gap-2"
        role="tablist"
        aria-label="Catégories FAQ"
      >
        {groups.map((g) => (
          <Button
            key={g.id}
            type="button"
            role="tab"
            variant={g.id === tab ? "default" : "outline"}
            aria-selected={g.id === tab}
            onClick={() => setTab(g.id)}
            className={cn(
              "min-h-10 rounded-pill px-4 text-[13px]",
              g.id === tab && "bg-primary text-primary-foreground shadow-soft",
            )}
          >
            {g.label}
          </Button>
        ))}
      </div>
      {active ? <Faq items={active.items} /> : null}
    </div>
  );
}
