"use client";

import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import type { ChatMessage } from "@/app/(app)/assistant/actions";
import { Chat, type Queued } from "@/components/assistant/chat";
import { Mascot } from "@/components/home/mascot";
import { consumeCopilotDraft } from "@/lib/assistant/copilot-draft.client";
import type { AssistantFile } from "@/lib/assistant/files";

export function CopilotChatShell({
  initial,
  presets,
  keyMissing,
  firstName,
}: {
  initial: ChatMessage[];
  presets: string[];
  keyMissing: boolean;
  firstName?: string | null;
}) {
  const params = useSearchParams();
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

  return (
    <div className="flex min-h-[min(70vh,calc(100dvh-11rem))] flex-col overflow-hidden rounded-card border border-line bg-surface shadow-soft lg:min-h-[calc(100dvh-6.5rem)]">
      <header className="flex shrink-0 items-center gap-3 border-b border-line px-4 py-3 sm:px-5">
        <Link
          href="/accueil"
          className="inline-flex min-h-10 min-w-10 items-center justify-center rounded-pill text-muted-foreground transition-colors hover:bg-accent-soft hover:text-ink"
          aria-label="Retour à l’accueil"
        >
          <ArrowLeft className="size-5" aria-hidden />
        </Link>
        <Mascot mood="idle" className="size-10 flex-none" />
        <div className="min-w-0 flex-1">
          <p className="mono-label">/ Copilote ///</p>
          <p className="truncate text-[15px] font-semibold tracking-[-0.02em]">
            Ton agent Navpit
          </p>
        </div>
      </header>
      <Chat
        initial={initial}
        presets={presets}
        keyMissing={keyMissing}
        firstName={firstName}
        queued={queued}
      />
    </div>
  );
}
