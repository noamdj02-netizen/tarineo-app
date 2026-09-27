"use client";

import { useState } from "react";
import { SectionEnter } from "@/components/motion/reveal";
import { Faq } from "@/components/site/faq";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { FaqGroup } from "@/lib/site/tarineo";

/** FAQ par thème : onglets shadcn + accordéon. */
export function LandingFaqTabs({ groups }: { groups: FaqGroup[] }) {
  const [tab, setTab] = useState(groups[0]?.id ?? "");

  return (
    <SectionEnter>
      <Tabs
        value={tab}
        onValueChange={(v) => setTab(String(v))}
        className="gap-4"
      >
        <div className="flex justify-center">
          <TabsList
            aria-label="Catégories FAQ"
            className="rounded-xl"
          >
            {groups.map((g) => (
              <TabsTrigger
                key={g.id}
                id={`faq-tab-${g.id}`}
                value={g.id}
                className="rounded-lg px-4 text-[13.5px]"
              >
                {g.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </div>
        {groups.map((g) => (
          <TabsContent key={g.id} id={`faq-panel-${g.id}`} value={g.id}>
            <Faq items={g.items} />
          </TabsContent>
        ))}
      </Tabs>
    </SectionEnter>
  );
}
