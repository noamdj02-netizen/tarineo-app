import { Suspense } from "react";
import { loadAssistant } from "@/app/(app)/assistant/actions";
import { getViewer } from "@/lib/session";
import { CopilotChatShell } from "./chat-shell";

export const metadata = { title: "Copilote" };

export default async function CopilotePage() {
  const [viewer, data] = await Promise.all([getViewer(), loadAssistant()]);
  return (
    <Suspense>
      <CopilotChatShell
        initial={data.history}
        presets={data.presets}
        keyMissing={!process.env.ANTHROPIC_API_KEY}
        firstName={viewer?.firstName}
      />
    </Suspense>
  );
}
