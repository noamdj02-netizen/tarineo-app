"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ArrowUpRight } from "lucide-react";
import { runCopilotJob } from "@/app/(app)/copilote/jobs";
import { stashCopilotDraft } from "@/lib/assistant/copilot-draft.client";
import {
  AUTOMATION_CATEGORY_LABELS,
  AUTOMATIONS,
  CATEGORY_ICONS,
  COPILOT_FEATURE_LINKS,
  type Automation,
  type AutomationCategory,
} from "@/lib/home/automations";
import { cn } from "@/lib/utils";

function groupByCategory(items: readonly Automation[]) {
  const order: AutomationCategory[] = ["focus", "communication", "produit", "design"];
  return order
    .map((cat) => ({
      category: cat,
      items: items.filter((a) => a.category === cat),
    }))
    .filter((g) => g.items.length > 0);
}

export function AutomationsLibrary() {
  const router = useRouter();
  const groups = groupByCategory(AUTOMATIONS);

  const [jobMsg, setJobMsg] = useState<string | null>(null);

  async function launch(a: Automation) {
    if (a.job) {
      const res = await runCopilotJob(a.job);
      if (!res.ok) {
        setJobMsg(res.error);
        return;
      }
      stashCopilotDraft({
        question: `Job « ${a.label} » terminé.\n\n${res.summary}\n\nLien : ${res.href}`,
      });
      router.push("/copilote?send=1");
      return;
    }
    stashCopilotDraft({ question: a.prompt });
    router.push("/copilote?send=1");
  }

  return (
    <div className="flex flex-col gap-12">
      {jobMsg ? (
        <p role="status" className="rounded-card border border-destructive/30 bg-surface p-3 text-[14px]">
          {jobMsg}
        </p>
      ) : null}
      {groups.map(({ category, items }) => {
        const Icon = CATEGORY_ICONS[category];
        return (
          <section key={category} aria-labelledby={`auto-${category}`}>
            <h2
              id={`auto-${category}`}
              className="mb-4 flex items-center gap-2 text-[18px] font-semibold tracking-[-0.02em]"
            >
              <span className="grid size-9 place-items-center rounded-xl bg-accent-soft">
                <Icon className="size-4" aria-hidden />
              </span>
              {AUTOMATION_CATEGORY_LABELS[category]}
            </h2>
            <ul className="grid gap-3 sm:grid-cols-2">
              {items.map((a) => (
                <li key={a.id}>
                  <button
                    type="button"
                    onClick={() => launch(a)}
                    className="card-soft flex h-full w-full flex-col gap-2 p-4 text-left transition-shadow hover:shadow-lift"
                  >
                    <span className="text-[15px] font-semibold tracking-[-0.02em]">{a.label}</span>
                    <span className="text-[13.5px] leading-relaxed text-muted-foreground">{a.hint}</span>
                    <span className="mt-auto pt-1 font-mono text-[11px] text-muted-foreground">
                      {a.job ? "Job in-app →" : "Lancer dans le copilote →"}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          </section>
        );
      })}

      <section aria-labelledby="copilot-features">
        <h2 id="copilot-features" className="mb-2 text-[18px] font-semibold tracking-[-0.02em]">
          Aller plus loin
        </h2>
        <p className="mb-4 max-w-[52ch] text-[14.5px] text-muted-foreground">
          Modules Navpit à ouvrir à côté du copilote : schémas, landing, projets et ressources.
        </p>
        <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {COPILOT_FEATURE_LINKS.map((f) => {
            const Icon = f.icon;
            return (
              <li key={f.href}>
                <Link
                  href={f.href}
                  className={cn(
                    "card-soft group flex h-full flex-col gap-2 p-4 transition-shadow hover:shadow-lift",
                  )}
                >
                  <div className="flex items-start justify-between gap-2">
                    <span className="grid size-9 place-items-center rounded-xl bg-accent-soft">
                      <Icon className="size-4" aria-hidden />
                    </span>
                    <ArrowUpRight
                      className="size-4 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                      aria-hidden
                    />
                  </div>
                  <span className="text-[15px] font-semibold tracking-[-0.02em]">{f.label}</span>
                  <span className="text-[13px] leading-relaxed text-muted-foreground">{f.description}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </section>
    </div>
  );
}
