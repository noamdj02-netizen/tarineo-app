import { Suspense } from "react";
import { loadAssistant } from "@/app/(app)/assistant/actions";
import { isAgentRole } from "@/lib/assistant/roles";
import { listProjects } from "@/lib/projects/queries";
import { getViewer } from "@/lib/session";
import { CopilotChatShell } from "./chat-shell";

export const metadata = { title: "Copilote" };

export default async function CopilotePage({
  searchParams,
}: {
  searchParams: Promise<{ projet?: string; role?: string }>;
}) {
  const [{ projet, role: rawRole }, viewer, projects] = await Promise.all([
    searchParams,
    getViewer(),
    listProjects(),
  ]);
  const role = isAgentRole(rawRole) ? rawRole : "general";
  const selected = projects.find((p) => p.slug === projet) ?? null;
  const data = await loadAssistant({ projectId: selected?.id ?? null, role });

  return (
    <div
      data-fill-viewport
      className="flex h-[min(70dvh,calc(100dvh-11rem))] min-h-0 flex-1 flex-col lg:h-full"
    >
      <Suspense>
        <CopilotChatShell
          initial={data.history}
          presets={data.presets}
          keyMissing={!process.env.ANTHROPIC_API_KEY}
          firstName={viewer?.firstName}
          projects={projects.map((p) => ({
            id: p.id,
            slug: p.slug,
            name: p.name,
            status: p.status,
          }))}
          projectId={selected?.id ?? null}
          role={role}
        />
      </Suspense>
    </div>
  );
}
