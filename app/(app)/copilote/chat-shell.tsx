"use client";

import { ArrowLeft, Layers, Plus, Sparkles } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import type { ChatMessage } from "@/app/(app)/assistant/actions";
import { Chat, type Queued } from "@/components/assistant/chat";
import { Mascot } from "@/components/home/mascot";
import { consumeCopilotDraft } from "@/lib/assistant/copilot-draft.client";
import type { AssistantFile } from "@/lib/assistant/files";
import { AGENT_ROLE_LABELS, AGENT_ROLES, type AgentRole } from "@/lib/assistant/roles";
import { cn } from "@/lib/utils";

export type CockpitProject = {
  id: string;
  slug: string;
  name: string;
  status: "focus" | "pause" | "fini";
};

export function CopilotChatShell({
  initial,
  presets,
  keyMissing,
  firstName,
  projects,
  projectId,
  role,
}: {
  initial: ChatMessage[];
  presets: string[];
  keyMissing: boolean;
  firstName?: string | null;
  projects: CockpitProject[];
  projectId: string | null;
  role: AgentRole;
}) {
  const params = useSearchParams();
  const router = useRouter();
  const [queued, setQueued] = useState<Queued>(null);
  const consumed = useRef(false);

  useEffect(() => {
    if (consumed.current) return;
    if (params.get("send") !== "1") return;
    consumed.current = true;
    const draft = consumeCopilotDraft();
    const q = draft?.question?.trim() ?? params.get("q")?.trim() ?? "";
    if (!q && !draft?.files?.length) return;
    setQueued({
      id: Date.now(),
      text: q,
      files: draft?.files as AssistantFile[] | undefined,
    });
  }, [params]);

  function go(next: { slug?: string | null; role?: AgentRole }) {
    const p = new URLSearchParams();
    const slug = next.slug === undefined ? params.get("chantier") ?? params.get("projet") : next.slug;
    const nextRole = next.role ?? role;
    if (slug) p.set("chantier", slug);
    if (nextRole !== "general") p.set("role", nextRole);
    router.push(p.size ? `/copilote?${p}` : "/copilote");
  }

  return (
    <div className="flex h-full min-h-0 flex-1 flex-col overflow-hidden rounded-card border border-line bg-surface shadow-soft lg:flex-row">
      <aside className="flex max-h-56 shrink-0 flex-col border-b border-line lg:max-h-none lg:h-full lg:w-[240px] lg:flex-none lg:border-r lg:border-b-0">
        <div className="flex items-center gap-2 border-b border-line px-3 py-3">
          <Link
            href="/accueil"
            className="inline-flex size-9 items-center justify-center rounded-pill text-muted-foreground hover:bg-accent-soft hover:text-ink"
            aria-label="Retour à l’accueil"
          >
            <ArrowLeft className="size-4" aria-hidden />
          </Link>
          <p className="text-[14px] font-semibold">Chantiers</p>
        </div>
        <ul className="flex min-h-0 gap-1 overflow-x-auto p-2 lg:flex-1 lg:flex-col lg:overflow-y-auto">
          <li>
            <button
              type="button"
              onClick={() => go({ slug: null })}
              className={cn(
                "min-h-10 w-full rounded-xl px-3 text-left text-[13.5px]",
                !projectId ? "bg-ink text-accent-ink" : "hover:bg-accent-soft",
              )}
            >
              Tous les chantiers
            </button>
          </li>
          {projects.map((p) => (
            <li key={p.id}>
              <button
                type="button"
                onClick={() => go({ slug: p.slug })}
                className={cn(
                  "flex min-h-10 w-full items-center gap-2 rounded-xl px-3 text-left text-[13.5px]",
                  projectId === p.id ? "bg-ink text-accent-ink" : "hover:bg-accent-soft",
                )}
              >
                {p.status === "focus" ? (
                  <span className="size-1.5 flex-none rounded-full bg-current" aria-hidden />
                ) : null}
                <span className="truncate">{p.name}</span>
              </button>
            </li>
          ))}
        </ul>
        <div className="mt-auto border-t border-line p-2">
          <p className="px-2 pb-1 font-mono text-[10px] tracking-[0.1em] text-muted-foreground uppercase">
            Rôle
          </p>
          <div className="flex flex-wrap gap-1">
            {AGENT_ROLES.map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => go({ role: r })}
                className={cn(
                  "min-h-8 rounded-pill px-2.5 font-mono text-[11px]",
                  role === r ? "bg-ink text-accent-ink" : "text-muted-foreground hover:bg-accent-soft",
                )}
              >
                {AGENT_ROLE_LABELS[r]}
              </button>
            ))}
          </div>
        </div>
      </aside>

      <div className="flex min-h-0 min-w-0 flex-1 flex-col">
        <header className="flex shrink-0 items-center gap-3 border-b border-line px-4 py-3">
          <Mascot mood="idle" className="size-10 flex-none" />
          <div className="min-w-0 flex-1">
            <p className="mono-label">/ Analyse ///</p>
            <p className="truncate text-[15px] font-semibold tracking-[-0.02em]">
              {projects.find((p) => p.id === projectId)?.name ?? "Tous les chantiers"} ·{" "}
              {AGENT_ROLE_LABELS[role]}
            </p>
          </div>
        </header>
        <ActionStrip
          keyMissing={keyMissing}
          onAsk={(text) => setQueued({ id: Date.now(), text })}
        />
        <Chat
          key={`${projectId ?? "all"}-${role}`}
          initial={initial}
          presets={presets}
          keyMissing={keyMissing}
          firstName={firstName}
          queued={queued}
          projectId={projectId}
          role={role}
        />
      </div>
    </div>
  );
}

function ActionStrip({
  keyMissing,
  onAsk,
}: {
  keyMissing: boolean;
  onAsk: (text: string) => void;
}) {
  return (
    <div className="shrink-0 border-b border-line px-3 py-2">
      <div className="flex flex-wrap gap-1.5">
        <Link
          href="/distributeur/devis"
          className="inline-flex min-h-9 items-center gap-1.5 rounded-xl border border-line px-2.5 text-[12.5px] hover:bg-accent-soft"
        >
          <Plus className="size-3.5" aria-hidden />
          Déposer un devis
        </Link>
        <button
          type="button"
          disabled={keyMissing}
          onClick={() =>
            onAsk("Liste les hausses de prix à partir des derniers documents d’achat, par chantier.")
          }
          className="inline-flex min-h-9 items-center gap-1.5 rounded-xl border border-line px-2.5 text-[12.5px] hover:bg-accent-soft disabled:opacity-50"
        >
          <Layers className="size-3.5" aria-hidden />
          Hausses
        </button>
        <Link
          href="/client/devis"
          className="inline-flex min-h-9 items-center gap-1.5 rounded-xl border border-line px-2.5 text-[12.5px] hover:bg-accent-soft"
        >
          <Sparkles className="size-3.5" aria-hidden />
          Pièces client
        </Link>
      </div>
    </div>
  );
}
